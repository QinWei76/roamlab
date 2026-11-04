
import type {
  TravelerReadinessProfile,
} from "@/types/wildTravelerProfile";

import {
  createDefaultTravelerProfile,
} from "@/types/wildTravelerProfile";

/**
 * ROAMLAB — TRAVELER PROFILE STORE
 *
 * Stores one readiness profile per Wild.
 *
 * Uses a separate localStorage namespace.
 * Does not modify Current Wild or Preparation Plan.
 */

const STORAGE_PREFIX = "roamlab.traveler-profile.v1.";

export const TRAVELER_PROFILE_UPDATED_EVENT =
  "roamlab:traveler-profile-updated";

function storageKey(wildId: string): string {
  return `${STORAGE_PREFIX}${wildId}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isValidProfile(
  value: unknown,
  wildId: string
): value is TravelerReadinessProfile {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const profile = value as Partial<TravelerReadinessProfile>;

  return (
    profile.wildId === wildId &&
    typeof profile.experience === "string" &&
    typeof profile.fitness === "string" &&
    Array.isArray(profile.activities) &&
    typeof profile.skills === "object" &&
    profile.skills !== null &&
    typeof profile.notes === "string"
  );
}

/**
 * Read a saved profile.
 */
export function getSavedTravelerProfile(
  wildId: string
): TravelerReadinessProfile | null {
  if (!isBrowser() || !wildId) return null;

  try {
    const raw = window.localStorage.getItem(
      storageKey(wildId)
    );

    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    if (!isValidProfile(parsed, wildId)) {
      console.warn(
        "RoamLab: invalid traveler profile."
      );
      return null;
    }

    return parsed;
  } catch (error) {
    console.error(
      "RoamLab: unable to read traveler profile.",
      error
    );

    return null;
  }
}

/**
 * Save a traveler profile.
 *
 * Throws on failure so the UI can display
 * an accurate error message.
 */
export function saveTravelerProfile(
  profile: TravelerReadinessProfile
): TravelerReadinessProfile {
  if (!isBrowser()) {
    throw new Error(
      "Traveler profiles can only be saved in the browser."
    );
  }

  if (!profile.wildId) {
    throw new Error("Missing Wild ID.");
  }

  const updated: TravelerReadinessProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  if (!isValidProfile(updated, updated.wildId)) {
    throw new Error("Invalid traveler profile.");
  }

  try {
    window.localStorage.setItem(
      storageKey(updated.wildId),
      JSON.stringify(updated)
    );
  } catch (error) {
    console.error(
      "RoamLab: unable to save traveler profile.",
      error
    );

    throw error;
  }

  window.dispatchEvent(
    new CustomEvent(TRAVELER_PROFILE_UPDATED_EVENT, {
      detail: updated,
    })
  );

  return updated;
}

/**
 * Load a saved profile or create a blank one.
 *
 * A blank profile is not persisted until saved.
 */
export function getOrCreateTravelerProfile(
  wildId: string
): TravelerReadinessProfile {
  if (!wildId) {
    throw new Error("Missing Wild ID.");
  }

  return (
    getSavedTravelerProfile(wildId) ??
    createDefaultTravelerProfile(wildId)
  );
}

/**
 * Update selected profile fields without
 * overwriting the existing skills object.
 */
export function updateTravelerProfile(
  wildId: string,
  changes: Partial<
    Omit<TravelerReadinessProfile, "wildId">
  >
): TravelerReadinessProfile {
  const existing = getOrCreateTravelerProfile(wildId);

  const updated: TravelerReadinessProfile = {
    ...existing,
    ...changes,
    wildId,
    skills: {
      ...existing.skills,
      ...(changes.skills ?? {}),
    },
  };

  return saveTravelerProfile(updated);
}
