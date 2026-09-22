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

/**
 * Strength / provenance of one piece of
 * destination evidence.
 *
 * verified
 * → comes from structured provider data
 *
 * derived
 * → inferred by RoamLab from provider text
 *   or other factual destination metadata
 */
export type DestinationEvidenceType =
  | "verified"
  | "derived";

/**
 * Evidence that supports one activity match.
 */
export interface DestinationActivityEvidence {
  activity: WildActivity;
  type: DestinationEvidenceType;
  source: DestinationSource;
}

/**
 * Evidence that supports one environment /
 * landscape signal.
 *
 * Environment remains a string because RoamLab
 * does not yet have a structured provider source
 * equivalent to RIDB Activities.
 */
export interface DestinationEnvironmentEvidence {
  environment: string;
  type: "derived";
  source: DestinationSource;

  /**
   * Short factual signal that caused RoamLab
   * to identify this environment.
   *
   * Example:
   * "mountain"
   * "canyon"
   * "lake"
   *
   * Do not store large provider text excerpts here.
   */
  signal?: string;
}

/**
 * Evidence used to explain why a destination
 * fits the current Wild.
 *
 * This is intentionally separate from matchScore.
 *
 * Evidence answers:
 * "What do we actually know?"
 *
 * Ranking answers:
 * "How should we order the candidates?"
 */
export interface DestinationEvidence {
  activities?: DestinationActivityEvidence[];
  environments?: DestinationEnvironmentEvidence[];
}

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
   * Explainable evidence layer.
   *
   * This does not replace activities,
   * environments, distanceKm, or matchScore.
   *
   * It records WHY RoamLab believes a factual
   * match exists and where that evidence came
   * from.
   */
  evidence?: DestinationEvidence;

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
