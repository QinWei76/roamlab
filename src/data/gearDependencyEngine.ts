import type {
  GearDependencyRule,
  GearOwnershipStatus,
  GearSystemEffects,
  TripGearItem,
  TripGearState,
} from "@/types/gearSystem";

/* =========================================================
   ROAMLAB GEAR DEPENDENCY ENGINE — V1

   Purpose:
   Make gear choices affect other categories.

   Core principle:

   OWNED
   and
   TO BUY

   both count as equipment that will be part of
   the final trip system.

   NOT NEEDED
   does not create dependency effects.

   This engine does NOT recommend products yet.
   It only calculates system effects.
   ========================================================= */

/* =========================================================
   1. ACTIVE GEAR STATUS

   Gear affects the system if the user:

   - already owns it and plans to bring it
   - plans to buy it

   ========================================================= */

export const ACTIVE_GEAR_STATUSES: GearOwnershipStatus[] = [
  "owned",
  "to-buy",
];

/* =========================================================
   2. DEPENDENCY RESULT TYPES
   ========================================================= */

export type PowerDependencySummary = {
  estimatedDailyWh: number;
  peakAcLoadW: number;
  surgeLoadW: number;
  contributingItemIds: string[];
};

export type WaterDependencySummary = {
  storedWaterLiters: number;
  dailyWaterDemandLiters: number;
  contributingItemIds: string[];
};

export type SpaceDependencySummary = {
  totalVolumeLiters: number;
  totalWeightKg: number;
  roofMountedWeightKg: number;
  contributingItemIds: string[];
};

export type FuelDependencySummary = {
  propaneAmount: number;
  butaneAmount: number;
  isobutaneAmount: number;
  gasolineAmount: number;
  dieselAmount: number;
  otherAmount: number;
  contributingItemIds: string[];
};

export type CategorySatisfactionSummary = {
  category: string;
  satisfiedByItemIds: string[];
};

export type GearDependencyAnalysis = {
  power: PowerDependencySummary;
  water: WaterDependencySummary;
  space: SpaceDependencySummary;
  fuel: FuelDependencySummary;
  satisfiedCategories: CategorySatisfactionSummary[];
  activeItems: TripGearItem[];
};

/* =========================================================
   3. DEFAULT DEPENDENCY RULES

   These rules are intentionally small in V1.

   Later we can expand this file with:
   - fridge
   - heater
   - electric blanket
   - portable AC
   - water pump
   - compressor
   - induction cooker
   - recovery winch
   - solar
   etc.

   ========================================================= */

export const defaultGearDependencyRules: GearDependencyRule[] = [
  {
    id: "fridge-power-load",

    name: "12V Fridge Power Load",

    sourceCategory: "food-storage",

    sourceItemName: "12V Fridge",

    appliesWhenStatus: [
      "owned",
      "to-buy",
    ],

    effects: [
      {
        targetCategory: "power",

        metric: "dailyWh",

        operation: "add",

        value: 450,

        unit: "Wh/day",

        reason:
          "A 12V fridge creates continuous daily electrical demand.",
      },

      {
        targetCategory: "food-storage",

        metric: "refrigeratedStorage",

        operation: "set",

        value: true,

        reason:
          "A 12V fridge satisfies refrigerated food-storage capability.",
      },
    ],
  },

  {
    id: "induction-cooker-power-load",

    name: "Induction Cooker Power Load",

    sourceCategory: "cooking",

    sourceItemName: "Induction Cooker",

    appliesWhenStatus: [
      "owned",
      "to-buy",
    ],

    effects: [
      {
        targetCategory: "power",

        metric: "continuousOutputW",

        operation: "max",

        value: 1800,

        unit: "W",

        reason:
          "Induction cooking requires high continuous AC output.",
      },

      {
        targetCategory: "power",

        metric: "dailyWh",

        operation: "add",

        value: 600,

        unit: "Wh/day",

        reason:
          "Electric cooking significantly increases daily battery consumption.",
      },

      {
        targetCategory: "cooking",

        metric: "cookingCapability",

        operation: "set",

        value: true,

        reason:
          "An induction cooker satisfies the core cooking requirement.",
      },
    ],
  },

  {
    id: "propane-stove-cooking",

    name: "Propane Stove Cooking",

    sourceCategory: "cooking",

    sourceItemName: "Propane Stove",

    appliesWhenStatus: [
      "owned",
      "to-buy",
    ],

    effects: [
      {
        targetCategory: "cooking",

        metric: "cookingCapability",

        operation: "set",

        value: true,

        reason:
          "A propane stove satisfies the cooking requirement without adding major electrical load.",
      },
    ],
  },

  {
    id: "roof-tent-sleeping",

    name: "Roof Tent Sleeping System",

    sourceCategory: "sleeping",

    sourceItemName: "Roof Tent",

    appliesWhenStatus: [
      "owned",
      "to-buy",
    ],

    effects: [
      {
        targetCategory: "sleeping",

        metric: "sleepingCapability",

        operation: "set",

        value: true,

        reason:
          "A roof tent provides a dedicated sleeping platform.",
      },

      {
        targetCategory: "storage",

        metric: "roofSpaceUsed",

        operation: "set",

        value: true,

        reason:
          "A roof tent consumes roof-rack carrying space.",
      },
    ],
  },

  {
    id: "solar-panel-power-recharge",

    name: "Solar Panel Recharge Capability",

    sourceCategory: "power",

    sourceItemName: "Solar Panel",

    appliesWhenStatus: [
      "owned",
      "to-buy",
    ],

    effects: [
      {
        targetCategory: "power",

        metric: "solarRechargeAvailable",

        operation: "set",

        value: true,

        reason:
          "Solar panels provide off-grid battery recharge capability.",
      },
    ],
  },

  {
    id: "satellite-communicator-safety",

    name: "Satellite Communicator Safety",

    sourceCategory: "communication",

    sourceItemName: "Satellite Communicator",

    appliesWhenStatus: [
      "owned",
      "to-buy",
    ],

    effects: [
      {
        targetCategory: "communication",

        metric: "remoteCommunication",

        operation: "set",

        value: true,

        reason:
          "Satellite communication provides emergency contact capability beyond cellular coverage.",
      },

      {
        targetCategory: "power",

        metric: "dailyWh",

        operation: "add",

        value: 8,

        unit: "Wh/day",

        reason:
          "Satellite communicators create a small rechargeable-device load.",
      },
    ],
  },
];

/* =========================================================
   4. ACTIVE ITEM CHECK
   ========================================================= */

export function isActiveGearItem(
  item: TripGearItem
) {
  return ACTIVE_GEAR_STATUSES.includes(
    item.status
  );
}

/* =========================================================
   5. POWER LOAD CALCULATION

   Uses the item's actual effects first.

   Example:

   powerLoad: {
     watts: 45,
     hoursPerDay: 10,
     dutyCycle: 0.5
   }

   45 × 10 × 0.5 = 225 Wh/day

   ========================================================= */

export function calculateItemDailyWh(
  item: TripGearItem
) {
  const load =
    item.effects?.powerLoad;

  if (!load) {
    return 0;
  }

  const quantity =
    load.quantity ??
    item.quantity ??
    1;

  const dutyCycle =
    load.dutyCycle ?? 1;

  return (
    load.watts *
    load.hoursPerDay *
    quantity *
    dutyCycle
  );
}

/* =========================================================
   6. POWER SUMMARY
   ========================================================= */

export function calculatePowerDependencies(
  items: TripGearItem[]
): PowerDependencySummary {
  let estimatedDailyWh = 0;
  let peakAcLoadW = 0;
  let surgeLoadW = 0;

  const contributingItemIds: string[] = [];

  for (const item of items) {
    if (!isActiveGearItem(item)) {
      continue;
    }

    const load =
      item.effects?.powerLoad;

    if (!load) {
      continue;
    }

    contributingItemIds.push(item.id);

    estimatedDailyWh +=
      calculateItemDailyWh(item);

    peakAcLoadW = Math.max(
      peakAcLoadW,
      load.watts
    );

    surgeLoadW = Math.max(
      surgeLoadW,
      load.surgeWatts ??
        load.watts
    );
  }

  return {
    estimatedDailyWh:
      Math.round(estimatedDailyWh),

    peakAcLoadW:
      Math.round(peakAcLoadW),

    surgeLoadW:
      Math.round(surgeLoadW),

    contributingItemIds,
  };
}

/* =========================================================
   7. WATER SUMMARY
   ========================================================= */

export function calculateWaterDependencies(
  items: TripGearItem[]
): WaterDependencySummary {
  let storedWaterLiters = 0;
  let dailyWaterDemandLiters = 0;

  const contributingItemIds: string[] = [];

  for (const item of items) {
    if (!isActiveGearItem(item)) {
      continue;
    }

    const water =
      item.effects?.waterLoad;

    if (!water) {
      continue;
    }

    contributingItemIds.push(item.id);

    const quantity =
      water.quantity ??
      item.quantity ??
      1;

    if (
      typeof water.liters === "number"
    ) {
      storedWaterLiters +=
        water.liters * quantity;
    }

    if (
      typeof water.litersPerDay ===
      "number"
    ) {
      dailyWaterDemandLiters +=
        water.litersPerDay *
        quantity;
    }
  }

  return {
    storedWaterLiters:
      Number(
        storedWaterLiters.toFixed(1)
      ),

    dailyWaterDemandLiters:
      Number(
        dailyWaterDemandLiters.toFixed(
          1
        )
      ),

    contributingItemIds,
  };
}

/* =========================================================
   8. SPACE / WEIGHT SUMMARY
   ========================================================= */

export function calculateSpaceDependencies(
  items: TripGearItem[]
): SpaceDependencySummary {
  let totalVolumeLiters = 0;
  let totalWeightKg = 0;
  let roofMountedWeightKg = 0;

  const contributingItemIds: string[] = [];

  for (const item of items) {
    if (!isActiveGearItem(item)) {
      continue;
    }

    const space =
      item.effects?.spaceLoad;

    if (!space) {
      continue;
    }

    contributingItemIds.push(item.id);

    const quantity =
      item.quantity ?? 1;

    if (
      typeof space.volumeLiters ===
      "number"
    ) {
      totalVolumeLiters +=
        space.volumeLiters *
        quantity;
    }

    if (
      typeof space.weightKg ===
      "number"
    ) {
      totalWeightKg +=
        space.weightKg *
        quantity;

      if (space.roofMounted) {
        roofMountedWeightKg +=
          space.weightKg *
          quantity;
      }
    }
  }

  return {
    totalVolumeLiters:
      Number(
        totalVolumeLiters.toFixed(1)
      ),

    totalWeightKg:
      Number(
        totalWeightKg.toFixed(1)
      ),

    roofMountedWeightKg:
      Number(
        roofMountedWeightKg.toFixed(1)
      ),

    contributingItemIds,
  };
}

/* =========================================================
   9. FUEL SUMMARY

   V1 keeps amounts separate by fuel type.

   Because units may differ, this engine intentionally
   does NOT convert propane / butane / gasoline into
   one universal number yet.
   ========================================================= */

export function calculateFuelDependencies(
  items: TripGearItem[]
): FuelDependencySummary {
  let propaneAmount = 0;
  let butaneAmount = 0;
  let isobutaneAmount = 0;
  let gasolineAmount = 0;
  let dieselAmount = 0;
  let otherAmount = 0;

  const contributingItemIds: string[] = [];

  for (const item of items) {
    if (!isActiveGearItem(item)) {
      continue;
    }

    const fuel =
      item.effects?.fuelLoad;

    if (!fuel) {
      continue;
    }

    contributingItemIds.push(item.id);

    const amount =
      fuel.amount ?? 0;

    switch (fuel.fuelType) {
      case "propane":
        propaneAmount += amount;
        break;

      case "butane":
        butaneAmount += amount;
        break;

      case "isobutane":
        isobutaneAmount += amount;
        break;

      case "gasoline":
        gasolineAmount += amount;
        break;

      case "diesel":
        dieselAmount += amount;
        break;

      default:
        otherAmount += amount;
        break;
    }
  }

  return {
    propaneAmount,
    butaneAmount,
    isobutaneAmount,
    gasolineAmount,
    dieselAmount,
    otherAmount,
    contributingItemIds,
  };
}

/* =========================================================
   10. CATEGORY SATISFACTION

   Example:

   Roof Tent
   satisfiesCategories = ["sleeping"]

   12V Fridge
   satisfiesCategories = ["food-storage"]

   ========================================================= */

export function calculateCategorySatisfaction(
  items: TripGearItem[]
): CategorySatisfactionSummary[] {
  const map = new Map<
    string,
    string[]
  >();

  for (const item of items) {
    if (!isActiveGearItem(item)) {
      continue;
    }

    const categories =
      item.effects
        ?.satisfiesCategories;

    if (!categories) {
      continue;
    }

    for (const category of categories) {
      const current =
        map.get(category) ?? [];

      current.push(item.id);

      map.set(
        category,
        current
      );
    }
  }

  return Array.from(
    map.entries()
  ).map(
    ([
      category,
      satisfiedByItemIds,
    ]) => ({
      category,
      satisfiedByItemIds,
    })
  );
}

/* =========================================================
   11. COMPLETE DEPENDENCY ANALYSIS

   This is the main function other engines should call.

   ========================================================= */

export function analyzeGearDependencies(
  gearState: TripGearState
): GearDependencyAnalysis {
  const activeItems =
    gearState.items.filter(
      isActiveGearItem
    );

  return {
    power:
      calculatePowerDependencies(
        activeItems
      ),

    water:
      calculateWaterDependencies(
        activeItems
      ),

    space:
      calculateSpaceDependencies(
        activeItems
      ),

    fuel:
      calculateFuelDependencies(
        activeItems
      ),

    satisfiedCategories:
      calculateCategorySatisfaction(
        activeItems
      ),

    activeItems,
  };
}

/* =========================================================
   12. HELPER:
   GET ACTIVE ITEMS BY CATEGORY
   ========================================================= */

export function getActiveItemsByCategory(
  gearState: TripGearState,
  category: TripGearItem["category"]
) {
  return gearState.items.filter(
    (item) =>
      item.category === category &&
      isActiveGearItem(item)
  );
}

/* =========================================================
   13. HELPER:
   GET OWNED ITEMS
   ========================================================= */

export function getOwnedGear(
  gearState: TripGearState
) {
  return gearState.items.filter(
    (item) =>
      item.status === "owned"
  );
}

/* =========================================================
   14. HELPER:
   GET TO-BUY ITEMS

   Only these items should normally consume
   the user's purchase budget.
   ========================================================= */

export function getGearToBuy(
  gearState: TripGearState
) {
  return gearState.items.filter(
    (item) =>
      item.status === "to-buy"
  );
}

/* =========================================================
   15. HELPER:
   CALCULATE PLANNED PURCHASE SPEND

   IMPORTANT:

   Budget is a ceiling.

   This function does NOT try to spend the entire budget.
   It simply calculates the current planned cost
   of TO-BUY items.
   ========================================================= */

export function calculatePlannedSpend(
  gearState: TripGearState
) {
  return getGearToBuy(
    gearState
  ).reduce(
    (total, item) => {
      const budget =
        item.plannedBudget ?? 0;

      return (
        total +
        budget *
          Math.max(
            1,
            item.quantity
          )
      );
    },
    0
  );
}

/* =========================================================
   16. HELPER:
   GET REMAINING BUDGET
   ========================================================= */

export function calculateRemainingBudget(
  gearState: TripGearState
) {
  if (
    typeof gearState.totalBudget !==
    "number"
  ) {
    return null;
  }

  const plannedSpend =
    calculatePlannedSpend(
      gearState
    );

  return Math.max(
    0,
    gearState.totalBudget -
      plannedSpend
  );
}

/* =========================================================
   17. EFFECT BUILDER HELPERS

   These will make future product / gear data
   easier to create consistently.
   ========================================================= */

export function createElectricalGearEffects({
  watts,
  hoursPerDay,
  dutyCycle = 1,
  surgeWatts,
  satisfiesCategories = [],
}: {
  watts: number;
  hoursPerDay: number;
  dutyCycle?: number;
  surgeWatts?: number;
  satisfiesCategories?: TripGearItem["category"][];
}): GearSystemEffects {
  return {
    powerLoad: {
      watts,
      hoursPerDay,
      dutyCycle,
      surgeWatts,
    },

    satisfiesCategories,

    affectsCategories: [
      "power",
    ],
  };
}

/* =========================================================
   18. V1 DESIGN NOTE

   defaultGearDependencyRules above are declarative rules.

   The direct calculations in this file primarily use
   TripGearItem.effects.

   Why?

   Because real owned gear can have actual user-specific
   specs.

   Example:

   User A fridge:
   35W × 8h/day

   User B fridge:
   60W × 14h/day

   These should NOT both be forced into the same
   generic dependency value.

   Therefore:

   generic rule
   → fallback/default knowledge

   item.effects
   → actual trip-specific data

   This distinction will matter later.
   ========================================================= */
