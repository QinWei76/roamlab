import type {
  Wild,
  WildActivity,
  WildCrew,
  WildDestination,
  WildDurationType,
  WildGearSystem,
  WildIntent,
  WildPrepare,
  WildSafety,
  WildKnowledge,
  WildCostSystem,
  WildReadiness,
  WildRoute,
  WildConditions,
  WildTripStyle,
  WildVehicle,
  WildVisibility,
  WildWayIn,
} from "@/types/wild";


/* =========================================================
   ROAMLAB — CURRENT WILD STORE
   =========================================================

   V1:
   Browser localStorage

   Later:
   Supabase / authenticated user storage

   PURPOSE:
   All planning systems work on the SAME Wild.

   Ways In
       ↓
   Current Wild
       ↓
   Prepare / Gear Room
   Route
   Safety
   Knowledge
   Cost
   Readiness
       ↓
   Your Wild Plan

   IMPORTANT:
   This store does NOT belong to Ways In or Gear Room.
   It belongs to the entire RoamLab Wild lifecycle.
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const CURRENT_WILD_KEY = "roamlab.currentWild";

export const CURRENT_WILD_UPDATED_EVENT =
  "roamlab:current-wild-updated";


/* =========================================================
   HELPERS
   ========================================================= */

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function nowISO(): string {
  return new Date().toISOString();
}

function createId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `wild-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function notifyWildUpdated(wild: Wild | null): void {
  if (!isBrowser()) return;

  window.dispatchEvent(
    new CustomEvent(CURRENT_WILD_UPDATED_EVENT, {
      detail: wild,
    })
  );
}


/* =========================================================
   CREATE EMPTY WILD
   ========================================================= */

export function createEmptyWild(
  title = "My Wild"
): Wild {
  const timestamp = nowISO();

  return {
    id: createId(),

    title,

    status: "planning",

    visibility: "private",

    createdAt: timestamp,

    updatedAt: timestamp,

    plan: {
      adventure: {
        activities: [],
      },
    },
  };
}


/* =========================================================
   READ CURRENT WILD
   ========================================================= */

export function getCurrentWild(): Wild | null {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(
    CURRENT_WILD_KEY
  );

  if (!raw) return null;

  try {
    return JSON.parse(raw) as Wild;
  } catch (error) {
    console.error(
      "RoamLab: failed to read current Wild.",
      error
    );

    return null;
  }
}


/* =========================================================
   SAVE CURRENT WILD
   ========================================================= */

export function saveCurrentWild(
  wild: Wild
): Wild {
  if (!isBrowser()) return wild;

  const updatedWild: Wild = {
    ...wild,
    updatedAt: nowISO(),
  };

  window.localStorage.setItem(
    CURRENT_WILD_KEY,
    JSON.stringify(updatedWild)
  );

  notifyWildUpdated(updatedWild);

  return updatedWild;
}


/* =========================================================
   GET OR CREATE CURRENT WILD
   ========================================================= */

export function getOrCreateCurrentWild(
  title = "My Wild"
): Wild {
  const existing = getCurrentWild();

  if (existing) {
    return existing;
  }

  const wild = createEmptyWild(title);

  return saveCurrentWild(wild);
}


/* =========================================================
   CLEAR CURRENT WILD
   ========================================================= */

export function clearCurrentWild(): void {
  if (!isBrowser()) return;

  window.localStorage.removeItem(
    CURRENT_WILD_KEY
  );

  notifyWildUpdated(null);
}


/* =========================================================
   GENERIC UPDATE
   ========================================================= */

export function updateCurrentWild(
  updater: (wild: Wild) => Wild
): Wild {
  const current = getOrCreateCurrentWild();

  const updated = updater(current);

  return saveCurrentWild(updated);
}


/* =========================================================
   BASIC WILD INFO
   ========================================================= */

export function updateWildIdentity(input: {
  title?: string;
  visibility?: WildVisibility;
}): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    title:
      input.title !== undefined
        ? input.title
        : wild.title,

    visibility:
      input.visibility !== undefined
        ? input.visibility
        : wild.visibility,
  }));
}


/* =========================================================
   WILD INTENT / DESTINATION DISCOVERY
   ========================================================= */

export function updateWildIntent(
  intent: Partial<WildIntent>
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      adventure: {
        ...wild.plan.adventure,

        intent: {
          ...wild.plan.adventure.intent,
          ...intent,
        },
      },
    },
  }));
}


/* =========================================================
   WAYS IN
   ========================================================= */

export function updateWildWayIn(
  wayIn: WildWayIn
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      adventure: {
        ...wild.plan.adventure,

        wayIn,
      },
    },
  }));
}


/* =========================================================
   ACTIVITIES
   ========================================================= */

export function updateWildActivities(
  activities: WildActivity[]
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      adventure: {
        ...wild.plan.adventure,

        activities,
      },
    },
  }));
}


/* =========================================================
   VEHICLE
   ========================================================= */

export function updateWildVehicle(
  vehicle: WildVehicle
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      adventure: {
        ...wild.plan.adventure,

        vehicle,
      },
    },
  }));
}


/* =========================================================
   TRIP STYLE
   ========================================================= */

export function updateWildTripStyle(
  tripStyle: WildTripStyle
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      adventure: {
        ...wild.plan.adventure,

        tripStyle,
      },
    },
  }));
}


/* =========================================================
   CREW
   ========================================================= */

export function updateWildCrew(
  crew: WildCrew
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      adventure: {
        ...wild.plan.adventure,

        crew,
      },
    },
  }));
}


/* =========================================================
   DURATION
   ========================================================= */

export function updateWildDuration(
  durationType: WildDurationType,
  options?: {
    days?: number;
    nights?: number;
  }
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      adventure: {
        ...wild.plan.adventure,

        schedule: {
          ...wild.plan.adventure.schedule,

          durationType,

          days:
            options?.days ??
            wild.plan.adventure.schedule?.days,

          nights:
            options?.nights ??
            wild.plan.adventure.schedule?.nights,
        },
      },
    },
  }));
}

/* =========================================================
   WILD SCHEDULE / DATES
   ========================================================= */

export function updateWildSchedule(input: {
  startDate?: string;
  endDate?: string;
  flexibleDates?: boolean;
}): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      adventure: {
        ...wild.plan.adventure,

        schedule: {
          ...wild.plan.adventure.schedule,

          startDate: input.startDate,

          endDate: input.endDate,

          flexibleDates: input.flexibleDates,
        },
      },
    },
  }));
}
/* =========================================================
   DESTINATION
   ========================================================= */

export function updateWildDestination(
  destination: WildDestination
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      adventure: {
        ...wild.plan.adventure,

        destination,
      },
    },
  }));
}


/* =========================================================
   ROUTE
   ========================================================= */

export function updateWildRoute(
  route: WildRoute
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      route,
    },
  }));
}


/* =========================================================
   CONDITIONS
   ========================================================= */

export function updateWildConditions(
  conditions: WildConditions
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      conditions,
    },
  }));
}


/* =========================================================
   PREPARE
   ========================================================= */

export function updateWildPrepare(
  prepare: WildPrepare
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      prepare,
    },
  }));
}


/* =========================================================
   GEAR SYSTEM
   ========================================================= */

export function updateWildGearSystem(
  gear: WildGearSystem
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      prepare: {
        ...wild.plan.prepare,

        gear,
      },
    },
  }));
}


/* =========================================================
   SAFETY
   ========================================================= */

export function updateWildSafety(
  safety: WildSafety
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      safety,
    },
  }));
}


/* =========================================================
   KNOWLEDGE
   ========================================================= */

export function updateWildKnowledge(
  knowledge: WildKnowledge
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      knowledge,
    },
  }));
}


/* =========================================================
   COST
   ========================================================= */

export function updateWildCost(
  cost: WildCostSystem
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      cost,
    },
  }));
}


/* =========================================================
   TOTAL WILD BUDGET
   ========================================================= */

export function updateTotalWildBudget(
  totalWildBudget: number,
  currency = "USD"
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      cost: {
        ...wild.plan.cost,

        currency,

        budgetMode: "total-wild-budget",

        totalWildBudget,
      },
    },
  }));
}


/* =========================================================
   GEAR BUDGET
   ========================================================= */

export function updateGearBudget(
  gearBudget: number,
  currency = "USD"
): Wild {
  return updateCurrentWild((wild) => {
    const existingCost = wild.plan.cost;

    return {
      ...wild,

      plan: {
        ...wild.plan,

        cost: {
          ...existingCost,

          currency:
            existingCost?.currency ??
            currency,

          budgetMode:
            existingCost?.budgetMode ??
            "gear-budget-only",

          gearBudget,
        },
      },
    };
  });
}


/* =========================================================
   READINESS
   ========================================================= */

export function updateWildReadiness(
  readiness: WildReadiness
): Wild {
  return updateCurrentWild((wild) => ({
    ...wild,

    plan: {
      ...wild.plan,

      readiness,
    },
  }));
}


/* =========================================================
   DEBUG HELPER
   ========================================================= */

export function logCurrentWild(): void {
  const wild = getCurrentWild();

  console.log(
    "RoamLab Current Wild:",
    wild
  );
}
