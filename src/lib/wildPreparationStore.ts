
import type { Wild } from "@/types/wild";
import type {
  PreparationPlan,
  PreparationStatus,
} from "@/types/wildPreparation";

import {
  generatePreparationPlan,
  mergePreparationPlan,
  setPreparationTaskStatus,
} from "@/lib/wildPreparation";

/**
 * ROAMLAB — PREPARATION PLAN STORE
 *
 * Stores preparation progress separately for each Wild.
 * Does not modify the existing Current Wild or Gear System.
 */

const STORAGE_PREFIX = "roamlab.preparation.v1.";

export const PREPARATION_UPDATED_EVENT =
  "roamlab:preparation-updated";

function storageKey(wildId: string): string {
  return `${STORAGE_PREFIX}${wildId}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifyUpdated(plan: PreparationPlan): void {
  if (!isBrowser()) return;

  window.dispatchEvent(
    new CustomEvent(PREPARATION_UPDATED_EVENT, {
      detail: plan,
    })
  );
}

/**
 * Read an existing preparation plan.
 * Returns null when no saved plan exists.
 */
export function getSavedPreparationPlan(
  wildId: string
): PreparationPlan | null {
  if (!isBrowser() || !wildId) return null;

  try {
    const raw = window.localStorage.getItem(
      storageKey(wildId)
    );

    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("wildId" in parsed) ||
      !("tasks" in parsed) ||
      parsed.wildId !== wildId ||
      !Array.isArray(parsed.tasks)
    ) {
      console.warn(
        "RoamLab: invalid saved preparation plan."
      );
      return null;
    }

    return parsed as PreparationPlan;
  } catch (error) {
    console.error(
      "RoamLab: failed to read preparation plan.",
      error
    );

    return null;
  }
}

/**
 * Save a preparation plan.
 *
 * Throws when browser storage fails, so the UI
 * must not report a successful save incorrectly.
 */
export function savePreparationPlan(
  plan: PreparationPlan
): PreparationPlan {
  if (!isBrowser()) {
    throw new Error(
      "Preparation plans can only be saved in the browser."
    );
  }

  if (!plan.wildId || !Array.isArray(plan.tasks)) {
    throw new Error("Invalid preparation plan.");
  }

  try {
    window.localStorage.setItem(
      storageKey(plan.wildId),
      JSON.stringify(plan)
    );
  } catch (error) {
    console.error(
      "RoamLab: failed to save preparation plan.",
      error
    );

    throw error;
  }

  notifyUpdated(plan);

  return plan;
}

/**
 * Generate the plan for the current Wild.
 *
 * Existing task decisions are preserved by
 * stable task ID.
 */

/**
 * Regenerate preparation guidance using the
 * Current Wild and saved Traveler Profile.
 *
 * Preserve task decisions by stable task ID.
 */
export function refreshPreparationPlan(
  wild: Wild
): PreparationPlan {
  // 1. Read previously saved task progress.
  const previous = getSavedPreparationPlan(wild.id);

  // 2. Generate the standard preparation plan.
  const basePlan = generatePreparationPlan(wild);

  // 3. Read the traveler profile for this Wild.
  const profile = getSavedTravelerProfile(wild.id);

  // 4. Apply personalized recommendations.
  const personalizedPlan = personalizePreparationPlan(
    basePlan,
    profile
  );

  // 5. Preserve previously completed task decisions.
  const merged = mergePreparationPlan(
    personalizedPlan,
    previous ?? undefined
  );

  // 6. Save the updated preparation plan.
  return savePreparationPlan(merged);
}

/**
 * Load an existing plan, or generate one if missing.
 *
 * This does not recalculate an existing plan.
 * Call refreshPreparationPlan after Wild data changes.
 */
export function getOrCreatePreparationPlan(
  wild: Wild
): PreparationPlan {
  const existing = getSavedPreparationPlan(wild.id);

  if (existing) return existing;

  return refreshPreparationPlan(wild);
}

/**
 * Update one task's status and save immediately.
 */
export function updatePreparationTaskStatus(
  wildId: string,
  taskId: string,
  status: PreparationStatus
): PreparationPlan {
  const validStatuses: PreparationStatus[] = [
    "todo",
    "in-progress",
    "done",
    "not-applicable",
  ];

  if (!validStatuses.includes(status)) {
    throw new Error("Invalid preparation status.");
  }

  const existing = getSavedPreparationPlan(wildId);

  if (!existing) {
    throw new Error(
      "No saved preparation plan exists for this Wild."
    );
  }

  if (!existing.tasks.some((task) => task.id === taskId)) {
    throw new Error(
      "Preparation task was not found."
    );
  }

  const updated = setPreparationTaskStatus(
    existing,
    taskId,
    status
  );

  return savePreparationPlan(updated);
}

/**
 * Summarize task progress.
 *
 * Not-applicable tasks are excluded from the
 * actionable total.
 *
 * Completion percentage is task progress only,
 * not a certification of expedition safety.
 */
export function getPreparationProgress(
  plan: PreparationPlan
) {
  const actionable = plan.tasks.filter(
    (task) => task.status !== "not-applicable"
  );

  const completed = actionable.filter(
    (task) => task.status === "done"
  ).length;

  const inProgress = actionable.filter(
    (task) => task.status === "in-progress"
  ).length;

  const total = actionable.length;

  return {
    total,
    completed,
    inProgress,
    remaining: total - completed,
    percent:
      total > 0
        ? Math.round((completed / total) * 100)
        : 0,
  };
}
