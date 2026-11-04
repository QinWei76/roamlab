
/**
 * ROAMLAB — TRAVELER READINESS PROFILE
 *
 * A trip-specific readiness profile.
 *
 * This profile records self-reported experience,
 * physical readiness, activities, and skills.
 *
 * It does not certify fitness, competence,
 * or expedition safety.
 */

export type TravelerExperience =
  | "unknown"
  | "beginner"
  | "intermediate"
  | "experienced";

export type TravelerFitness =
  | "unknown"
  | "light"
  | "moderate"
  | "high";

export type TravelerActivity =
  | "scenic-driving"
  | "day-hiking"
  | "camping"
  | "backcountry-hiking"
  | "off-road-driving"
  | "photography"
  | "wildlife-watching";

export type TravelerSkillLevel =
  | "unknown"
  | "none"
  | "basic"
  | "confident";

export interface TravelerSkills {
  navigation: TravelerSkillLevel;
  firstAid: TravelerSkillLevel;
  camping: TravelerSkillLevel;
  remoteTravel: TravelerSkillLevel;
}

export interface TravelerReadinessProfile {
  /**
   * Associated Wild ID.
   */
  wildId: string;

  /**
   * Self-reported experience.
   */
  experience: TravelerExperience;

  /**
   * Self-reported physical readiness.
   */
  fitness: TravelerFitness;

  /**
   * Activities planned for this Wild.
   */
  activities: TravelerActivity[];

  /**
   * Skills relevant to the trip.
   */
  skills: TravelerSkills;

  /**
   * Whether the group includes a traveler
   * who may need additional planning support.
   *
   * This is a planning flag, not a diagnosis.
   */
  additionalSupportNeeded: boolean | null;

  /**
   * Optional planning notes.
   */
  notes: string;

  /**
   * ISO timestamp.
   */
  updatedAt: string;
}

/**
 * Create a blank profile for a specific Wild.
 */
export function createDefaultTravelerProfile(
  wildId: string
): TravelerReadinessProfile {
  return {
    wildId,

    experience: "unknown",

    fitness: "unknown",

    activities: [],

    skills: {
      navigation: "unknown",
      firstAid: "unknown",
      camping: "unknown",
      remoteTravel: "unknown",
    },

    additionalSupportNeeded: null,

    notes: "",

    updatedAt: new Date().toISOString(),
  };
}
