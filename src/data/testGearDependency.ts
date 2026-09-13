import type {
  TripGearState,
  TripGearItem,
} from "@/types/gearSystem";

import {
  analyzeGearDependencies,
  calculatePlannedSpend,
  calculateRemainingBudget,
} from "@/data/gearDependencyEngine";

/* =========================================================
   ROAMLAB GEAR DEPENDENCY TEST — V1

   Purpose:

   Test two users with:

   - same adventure profile
   - same total budget
   - different owned gear
   - different gear they want RoamLab to configure

   Expected result:

   Different gear choices
   → different system loads
   → different Power requirements

   This proves:

   Budget ≠ Requirement

   Instead:

   Gear System State
   → Requirement
   → Gap
   → Recommendation
   → Budget Optimization
   ========================================================= */

/* =========================================================
   1. SHARED ADVENTURE PROFILE

   Both users take exactly the same trip.
   ========================================================= */

const sharedProfile = {
  vehicle: "crossover" as const,
  trip: "remote" as const,
  crew: "friends" as const,
  people: 5,
  duration: "multi-day" as const,
};

/* =========================================================
   2. USER A

   Budget:
   $3000

   Already owns:
   - 12V Fridge
   - Propane Stove
   - Headlamp

   Wants RoamLab to configure:
   - Portable Power Station
   - Solar Panel

   Key characteristic:

   Cooking uses propane.

   Therefore cooking does NOT create a large
   electrical load.
   ========================================================= */

const userAGear: TripGearItem[] = [
  {
    id: "user-a-fridge",

    name: "12V Fridge",

    category: "food-storage",

    status: "owned",

    priority: "essential",

    quantity: 1,

    effects: {
      powerLoad: {
        watts: 45,
        hoursPerDay: 10,

        /*
          Compressor fridge does not normally
          draw full rated power continuously.
        */

        dutyCycle: 0.5,
      },

      satisfiesCategories: [
        "food-storage",
      ],

      affectsCategories: [
        "power",
      ],
    },
  },

  {
    id: "user-a-propane-stove",

    name: "Propane Stove",

    category: "cooking",

    status: "owned",

    priority: "essential",

    quantity: 1,

    effects: {
      fuelLoad: {
        fuelType: "propane",

        amount: 1,

        unit: "lb",
      },

      satisfiesCategories: [
        "cooking",
      ],
    },
  },

  {
    id: "user-a-headlamp",

    name: "Rechargeable Headlamp",

    category: "lighting",

    status: "owned",

    priority: "essential",

    quantity: 1,

    effects: {
      powerLoad: {
        watts: 5,
        hoursPerDay: 2,
      },

      satisfiesCategories: [
        "lighting",
      ],

      affectsCategories: [
        "power",
      ],
    },
  },

  {
    id: "user-a-power-station",

    name: "Portable Power Station",

    category: "power",

    status: "to-buy",

    priority: "essential",

    quantity: 1,

    plannedBudget: 800,
  },

  {
    id: "user-a-solar-panel",

    name: "Solar Panel",

    category: "power",

    status: "to-buy",

    priority: "recommended",

    quantity: 1,

    plannedBudget: 300,

    effects: {
      satisfiesCategories: [
        "power",
      ],
    },
  },
];

export const userAState: TripGearState = {
  profile: sharedProfile,

  items: userAGear,

  totalBudget: 3000,

  currency: "USD",
};

/* =========================================================
   3. USER B

   Budget:
   $3000

   Already owns:
   - Cooler
   - Headlamp

   Wants RoamLab to configure:
   - Induction Cooker
   - Portable Power Station
   - Solar Panel

   Key characteristic:

   Cooking is electrical.

   Therefore:

   Daily energy demand ↑
   AC output requirement ↑
   Battery requirement ↑
   ========================================================= */

const userBGear: TripGearItem[] = [
  {
    id: "user-b-cooler",

    name: "Passive Cooler",

    category: "food-storage",

    status: "owned",

    priority: "essential",

    quantity: 1,

    effects: {
      satisfiesCategories: [
        "food-storage",
      ],
    },
  },

  {
    id: "user-b-headlamp",

    name: "Rechargeable Headlamp",

    category: "lighting",

    status: "owned",

    priority: "essential",

    quantity: 1,

    effects: {
      powerLoad: {
        watts: 5,
        hoursPerDay: 2,
      },

      satisfiesCategories: [
        "lighting",
      ],

      affectsCategories: [
        "power",
      ],
    },
  },

  {
    id: "user-b-induction-cooker",

    name: "Induction Cooker",

    category: "cooking",

    status: "to-buy",

    priority: "essential",

    quantity: 1,

    plannedBudget: 120,

    effects: {
      powerLoad: {
        /*
          High-power AC appliance.
        */

        watts: 1800,

        /*
          Approx. 20 minutes/day:

          20 / 60
          ≈ 0.333 hour
        */

        hoursPerDay: 0.333,

        surgeWatts: 1800,
      },

      satisfiesCategories: [
        "cooking",
      ],

      affectsCategories: [
        "power",
      ],
    },
  },

  {
    id: "user-b-power-station",

    name: "Portable Power Station",

    category: "power",

    status: "to-buy",

    priority: "essential",

    quantity: 1,

    plannedBudget: 1000,
  },

  {
    id: "user-b-solar-panel",

    name: "Solar Panel",

    category: "power",

    status: "to-buy",

    priority: "recommended",

    quantity: 1,

    plannedBudget: 400,

    effects: {
      satisfiesCategories: [
        "power",
      ],
    },
  },
];

export const userBState: TripGearState = {
  profile: sharedProfile,

  items: userBGear,

  totalBudget: 3000,

  currency: "USD",
};

/* =========================================================
   4. RUN DEPENDENCY ENGINE
   ========================================================= */

export const userADependency =
  analyzeGearDependencies(
    userAState
  );

export const userBDependency =
  analyzeGearDependencies(
    userBState
  );

/* =========================================================
   5. BUDGET ANALYSIS

   IMPORTANT:

   Budget is a ceiling.

   Remaining budget is allowed.

   RoamLab does NOT need to spend all $3000.
   ========================================================= */

export const userAPlannedSpend =
  calculatePlannedSpend(
    userAState
  );

export const userARemainingBudget =
  calculateRemainingBudget(
    userAState
  );

export const userBPlannedSpend =
  calculatePlannedSpend(
    userBState
  );

export const userBRemainingBudget =
  calculateRemainingBudget(
    userBState
  );

/* =========================================================
   6. READABLE TEST OUTPUT
   ========================================================= */

export const userATestResult = {
  user: "User A",

  budget:
    userAState.totalBudget,

  system: {
    cooking:
      "Propane Stove",

    foodStorage:
      "Owned 12V Fridge",
  },

  powerDemand: {
    estimatedDailyWh:
      userADependency.power
        .estimatedDailyWh,

    peakAcLoadW:
      userADependency.power
        .peakAcLoadW,

    surgeLoadW:
      userADependency.power
        .surgeLoadW,
  },

  budgetStatus: {
    plannedSpend:
      userAPlannedSpend,

    remainingBudget:
      userARemainingBudget,
  },

  satisfiedCategories:
    userADependency
      .satisfiedCategories,

  activeGear:
    userADependency.activeItems.map(
      (item) => ({
        name: item.name,
        status: item.status,
      })
    ),
};

export const userBTestResult = {
  user: "User B",

  budget:
    userBState.totalBudget,

  system: {
    cooking:
      "Induction Cooker",

    foodStorage:
      "Owned Passive Cooler",
  },

  powerDemand: {
    estimatedDailyWh:
      userBDependency.power
        .estimatedDailyWh,

    peakAcLoadW:
      userBDependency.power
        .peakAcLoadW,

    surgeLoadW:
      userBDependency.power
        .surgeLoadW,
  },

  budgetStatus: {
    plannedSpend:
      userBPlannedSpend,

    remainingBudget:
      userBRemainingBudget,
  },

  satisfiedCategories:
    userBDependency
      .satisfiedCategories,

  activeGear:
    userBDependency.activeItems.map(
      (item) => ({
        name: item.name,
        status: item.status,
      })
    ),
};

/* =========================================================
   7. COMPARISON
   ========================================================= */

export const dependencyComparison = {
  sameBudget:
    userAState.totalBudget ===
    userBState.totalBudget,

  sameAdventureProfile:
    JSON.stringify(
      userAState.profile
    ) ===
    JSON.stringify(
      userBState.profile
    ),

  userA: {
    dailyWh:
      userADependency.power
        .estimatedDailyWh,

    peakAcLoadW:
      userADependency.power
        .peakAcLoadW,

    plannedSpend:
      userAPlannedSpend,

    remainingBudget:
      userARemainingBudget,
  },

  userB: {
    dailyWh:
      userBDependency.power
        .estimatedDailyWh,

    peakAcLoadW:
      userBDependency.power
        .peakAcLoadW,

    plannedSpend:
      userBPlannedSpend,

    remainingBudget:
      userBRemainingBudget,
  },

  difference: {
    dailyWh:
      userBDependency.power
        .estimatedDailyWh -
      userADependency.power
        .estimatedDailyWh,

    peakAcLoadW:
      userBDependency.power
        .peakAcLoadW -
      userADependency.power
        .peakAcLoadW,
  },
};

/* =========================================================
   8. OPTIONAL CONSOLE TEST

   This function is NOT automatically executed.

   Later a test page can call it if needed.
   ========================================================= */

export function printGearDependencyTest() {
  console.log(
    "================================="
  );

  console.log(
    "ROAMLAB DEPENDENCY TEST"
  );

  console.log(
    "================================="
  );

  console.log(
    "USER A"
  );

  console.log(
    userATestResult
  );

  console.log(
    "---------------------------------"
  );

  console.log(
    "USER B"
  );

  console.log(
    userBTestResult
  );

  console.log(
    "---------------------------------"
  );

  console.log(
    "COMPARISON"
  );

  console.log(
    dependencyComparison
  );

  console.log(
    "================================="
  );
}
