import type {
  TripGearState,
  TripGearItem,
} from "@/types/gearSystem";

import {
  analyzeGearDependencies,
  calculatePlannedSpend,
  calculateRemainingBudget,
} from "@/data/gearDependencyEngine";

import {
  analyzeOwnedPowerGap,
} from "@/data/powerGapAnalysis";

/* =========================================================
   ROAMLAB GEAR DEPENDENCY + POWER GAP TEST — V2

   PURPOSE

   Two users:

   - same trip
   - same $3000 budget
   - different gear choices
   - different owned power equipment

   We test:

   Gear State
      ↓
   Dependency
      ↓
   Requirement
      ↓
   Owned Capability
      ↓
   Gap

   ========================================================= */


/* =========================================================
   1. SHARED ADVENTURE PROFILE
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

   SAME BUDGET: $3000

   OWNED:
   - 12V Fridge
   - Propane Stove
   - Headlamp
   - 768Wh Power Station
   - 200W Solar Panel

   TO BUY:
   - nothing in Power for this test

   Expected:

   Low electrical demand because cooking uses propane.

   Existing power equipment should be close to,
   or fully capable of, meeting the trip requirement.

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

  /* =======================================================
     USER A OWNED POWER STATION
     ======================================================= */

  {
    id: "user-a-owned-power-station",

    name: "768Wh Portable Power Station",

    category: "power",

    status: "owned",

    priority: "essential",

    quantity: 1,

    specs: {
      batteryCapacityWh: 768,

      continuousAcOutputW: 1000,

      surgeOutputW: 2000,

      maxSolarInputW: 300,

      maxAcRechargeW: 700,
    },

    satisfiesCategories: [
      // intentionally not used here
    ] as never,
  } as TripGearItem,

  /* =======================================================
     USER A OWNED SOLAR
     ======================================================= */

  {
    id: "user-a-owned-solar",

    name: "200W Solar Panel",

    category: "power",

    status: "owned",

    priority: "recommended",

    quantity: 1,

    specs: {
      panelW: 200,
      ratedPowerW: 200,
    },

    effects: {
      satisfiesCategories: [
        "power",
      ],
    },
  },
];


/* =========================================================
   3. USER A STATE
   ========================================================= */

export const userAState: TripGearState = {
  profile: sharedProfile,

  items: userAGear,

  totalBudget: 3000,

  currency: "USD",
};


/* =========================================================
   4. USER B

   SAME BUDGET: $3000

   OWNED:
   - Passive Cooler
   - Headlamp
   - 1024Wh Power Station
   - 400W Solar Panel

   TO BUY:
   - Induction Cooker

   Expected:

   Induction cooking dramatically increases:

   - daily Wh
   - AC output requirement
   - battery requirement

   Existing power station should therefore become
   insufficient even though it is a substantial unit.

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

  /* =======================================================
     USER B INTENDS TO BUY INDUCTION COOKER

     IMPORTANT:

     It is NOT owned.

     But because it is part of the intended final system,
     it MUST influence the Power Requirement.

     ======================================================= */

  {
    id: "user-b-induction-cooker",

    name: "Induction Cooker",

    category: "cooking",

    status: "to-buy",

    priority: "essential",

    quantity: 1,

    plannedBudget: 120,

    specs: {
      powerType: "ac",
    },

    effects: {
      powerLoad: {
        watts: 1800,

        /*
          Approx. 20 minutes per day
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

  /* =======================================================
     USER B OWNED POWER STATION

     Requirement is expected to be around:

     Battery:
     ~1700Wh

     AC Output:
     ~2200W

     Existing:
     1024Wh / 1800W

     Therefore:

     Battery = insufficient
     AC Output = insufficient

     ======================================================= */

  {
    id: "user-b-owned-power-station",

    name: "1024Wh Portable Power Station",

    category: "power",

    status: "owned",

    priority: "essential",

    quantity: 1,

    specs: {
      batteryCapacityWh: 1024,

      continuousAcOutputW: 1800,

      surgeOutputW: 2400,

      maxSolarInputW: 500,

      maxAcRechargeW: 1200,
    },
  },

  /* =======================================================
     USER B OWNED SOLAR

     Requirement should be around 300W.

     Existing panel:
     400W

     Power station solar input:
     500W

     Therefore usable solar capability:
     min(400, 500)
     = 400W

     Expected:
     SUFFICIENT

     ======================================================= */

  {
    id: "user-b-owned-solar",

    name: "400W Solar Panel",

    category: "power",

    status: "owned",

    priority: "recommended",

    quantity: 1,

    specs: {
      panelW: 400,
      ratedPowerW: 400,
    },

    effects: {
      satisfiesCategories: [
        "power",
      ],
    },
  },
];


/* =========================================================
   5. USER B STATE
   ========================================================= */

export const userBState: TripGearState = {
  profile: sharedProfile,

  items: userBGear,

  totalBudget: 3000,

  currency: "USD",
};


/* =========================================================
   6. DEPENDENCY ANALYSIS
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
   7. POWER GAP ANALYSIS

   This is the important new test.

   Requirement:
   calculated from FULL intended system.

   Capability:
   calculated from OWNED gear only.

   ========================================================= */

export const userAPowerGap =
  analyzeOwnedPowerGap(
    userAState
  );

export const userBPowerGap =
  analyzeOwnedPowerGap(
    userBState
  );


/* =========================================================
   8. BUDGET ANALYSIS

   Only TO-BUY gear consumes planned purchase budget.

   Owned power stations and solar panels should NOT
   consume the current purchase budget.

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
   9. READABLE USER A RESULT
   ========================================================= */

export const userATestResult = {
  user: "User A",

  budget:
    userAState.totalBudget,

  system: {
    cooking:
      "Owned Propane Stove",

    foodStorage:
      "Owned 12V Fridge",

    power:
      "Owned 768Wh Power Station",

    solar:
      "Owned 200W Solar",
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

  requirement: {
    batteryCapacityWh:
      userAPowerGap.requirement
        .requiredBatteryCapacityWh,

    continuousAcOutputW:
      userAPowerGap.requirement
        .requiredContinuousAcOutputW,

    surgeOutputW:
      userAPowerGap.requirement
        .requiredSurgeOutputW,

    solarInputW:
      userAPowerGap.requirement
        .recommendedSolarInputW,

    acRechargeW:
      userAPowerGap.requirement
        .recommendedAcRechargeW,
  },

  ownedCapability: {
    batteryCapacityWh:
      userAPowerGap
        .existingCapability
        .batteryCapacityWh,

    continuousAcOutputW:
      userAPowerGap
        .existingCapability
        .continuousAcOutputW,

    surgeOutputW:
      userAPowerGap
        .existingCapability
        .surgeOutputW,

    solarInputW:
      userAPowerGap
        .existingCapability
        .solarInputW,

    acRechargeW:
      userAPowerGap
        .existingCapability
        .acRechargeW,
  },

  gap: {
    missionCapable:
      userAPowerGap
        .missionCapable,

    needsPurchase:
      userAPowerGap
        .needsPurchase,

    needsUpgrade:
      userAPowerGap
        .needsUpgrade,

    missingMetrics:
      userAPowerGap
        .missingMetrics,
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
    userADependency
      .activeItems
      .map(
        (item) => ({
          name:
            item.name,

          status:
            item.status,
        })
      ),
};


/* =========================================================
   10. READABLE USER B RESULT
   ========================================================= */

export const userBTestResult = {
  user: "User B",

  budget:
    userBState.totalBudget,

  system: {
    cooking:
      "Induction Cooker",

    foodStorage:
      "Owned Passive Cooler",

    power:
      "Owned 1024Wh Power Station",

    solar:
      "Owned 400W Solar",
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

  requirement: {
    batteryCapacityWh:
      userBPowerGap.requirement
        .requiredBatteryCapacityWh,

    continuousAcOutputW:
      userBPowerGap.requirement
        .requiredContinuousAcOutputW,

    surgeOutputW:
      userBPowerGap.requirement
        .requiredSurgeOutputW,

    solarInputW:
      userBPowerGap.requirement
        .recommendedSolarInputW,

    acRechargeW:
      userBPowerGap.requirement
        .recommendedAcRechargeW,
  },

  ownedCapability: {
    batteryCapacityWh:
      userBPowerGap
        .existingCapability
        .batteryCapacityWh,

    continuousAcOutputW:
      userBPowerGap
        .existingCapability
        .continuousAcOutputW,

    surgeOutputW:
      userBPowerGap
        .existingCapability
        .surgeOutputW,

    solarInputW:
      userBPowerGap
        .existingCapability
        .solarInputW,

    acRechargeW:
      userBPowerGap
        .existingCapability
        .acRechargeW,
  },

  gap: {
    missionCapable:
      userBPowerGap
        .missionCapable,

    needsPurchase:
      userBPowerGap
        .needsPurchase,

    needsUpgrade:
      userBPowerGap
        .needsUpgrade,

    missingMetrics:
      userBPowerGap
        .missingMetrics,
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
    userBDependency
      .activeItems
      .map(
        (item) => ({
          name:
            item.name,

          status:
            item.status,
        })
      ),
};


/* =========================================================
   11. DEPENDENCY COMPARISON

   Kept for the existing /test-dependency page.
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
   12. POWER GAP COMPARISON

   New V2 output.
   ========================================================= */

export const powerGapComparison = {
  userA: {
    requirement: {
      batteryWh:
        userAPowerGap
          .requirement
          .requiredBatteryCapacityWh,

      acOutputW:
        userAPowerGap
          .requirement
          .requiredContinuousAcOutputW,

      solarW:
        userAPowerGap
          .requirement
          .recommendedSolarInputW,
    },

    owned: {
      batteryWh:
        userAPowerGap
          .existingCapability
          .batteryCapacityWh,

      acOutputW:
        userAPowerGap
          .existingCapability
          .continuousAcOutputW,

      solarW:
        userAPowerGap
          .existingCapability
          .solarInputW,
    },

    gap: {
      batteryWh:
        userAPowerGap
          .summary
          .batteryGapWh,

      acOutputW:
        userAPowerGap
          .summary
          .acOutputGapW,

      solarW:
        userAPowerGap
          .summary
          .solarGapW,
    },

    missionCapable:
      userAPowerGap
        .missionCapable,
  },

  userB: {
    requirement: {
      batteryWh:
        userBPowerGap
          .requirement
          .requiredBatteryCapacityWh,

      acOutputW:
        userBPowerGap
          .requirement
          .requiredContinuousAcOutputW,

      solarW:
        userBPowerGap
          .requirement
          .recommendedSolarInputW,
    },

    owned: {
      batteryWh:
        userBPowerGap
          .existingCapability
          .batteryCapacityWh,

      acOutputW:
        userBPowerGap
          .existingCapability
          .continuousAcOutputW,

      solarW:
        userBPowerGap
          .existingCapability
          .solarInputW,
    },

    gap: {
      batteryWh:
        userBPowerGap
          .summary
          .batteryGapWh,

      acOutputW:
        userBPowerGap
          .summary
          .acOutputGapW,

      solarW:
        userBPowerGap
          .summary
          .solarGapW,
    },

    missionCapable:
      userBPowerGap
        .missionCapable,
  },
};


/* =========================================================
   13. OPTIONAL CONSOLE TEST
   ========================================================= */

export function printGearDependencyTest() {
  console.log(
    "================================="
  );

  console.log(
    "ROAMLAB POWER GAP TEST"
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
    "POWER GAP COMPARISON"
  );

  console.log(
    powerGapComparison
  );

  console.log(
    "================================="
  );
}
