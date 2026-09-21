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
   * Destination characteristics.
   * These will be enriched progressively.
   */
  activities?: string[];
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
