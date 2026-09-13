import type {
  TripGearItem,
  TripGearState,
} from "@/types/gearSystem";

import {
  calculatePowerRequirement,
  type PowerRequirement,
} from "@/data/powerRequirementEngine";

import {
  isActiveGearItem,
} from "@/data/gearDependencyEngine";

/* =========================================================
   ROAMLAB POWER GAP ANALYSIS — V1

   PURPOSE

   Compare:

   REQUIRED POWER CAPABILITY
            vs
   USER'S EXISTING / PLANNED POWER CAPABILITY

   Then determine:

   - what is already sufficient
   - what is still missing
   - whether a purchase is needed
   - whether replacement / upgrade may be needed

   IMPORTANT:

   This file does NOT rank products.
   This file only calculates the gap.

   FLOW

   Gear State
      ↓
   Dependency
      ↓
   Power Requirement
      ↓
   Existing Capability
      ↓
   Gap Analysis
      ↓
   Product Recommendation

   ========================================================= */


/* =========================================================
   1. POWER CAPABILITY

   Represents combined technical capability
   already available in the user's trip system.

   Example:

   Owned power station:
   1024Wh
   1800W AC
   2400W surge
   500W solar input
   1200W AC recharge

   ========================================================= */

export type ExistingPowerCapability = {
  batteryCapacityWh: number;

  continuousAcOutputW: number;

  surgeOutputW: number;

  solarInputW: number;

  acRechargeW: number;

  contributingItemIds: string[];
};


/* =========================================================
   2. GAP STATUS
   ========================================================= */

export type PowerGapStatus =
  | "not-required"
  | "sufficient"
  | "insufficient"
  | "missing";


/* =========================================================
   3. SINGLE METRIC GAP
   ========================================================= */

export type PowerMetricGap = {
  metric:
    | "batteryCapacityWh"
    | "continuousAcOutputW"
    | "surgeOutputW"
    | "solarInputW"
    | "acRechargeW";

  label: string;

  required: number;

  available: number;

  gap: number;

  unit: "Wh" | "W";

  status: PowerGapStatus;

  needsPurchase: boolean;

  reason: string;
};


/* =========================================================
   4. COMPLETE GAP ANALYSIS RESULT
   ========================================================= */

export type PowerGapAnalysisResult = {
  requirement: PowerRequirement;

  existingCapability:
    ExistingPowerCapability;

  gaps: PowerMetricGap[];

  missionCapable: boolean;

  needsPurchase: boolean;

  needsUpgrade: boolean;

  missingMetrics: PowerMetricGap[];

  sufficientMetrics: PowerMetricGap[];

  summary: {
    requiredBatteryCapacityWh: number;

    availableBatteryCapacityWh: number;

    batteryGapWh: number;

    requiredContinuousAcOutputW: number;

    availableContinuousAcOutputW: number;

    acOutputGapW: number;

    requiredSolarInputW: number;

    availableSolarInputW: number;

    solarGapW: number;
  };

  reasons: string[];
};


/* =========================================================
   5. NUMBER READER

   Specs are flexible Record<string, ...> values.

   This helper safely reads numeric technical fields.
   ========================================================= */

function readNumber(
  item: TripGearItem,
  keys: string[]
) {
  for (const key of keys) {
    const value =
      item.specs?.[key];

    if (
      typeof value ===
      "number"
    ) {
      return value;
    }
  }

  return 0;
}


/* =========================================================
   6. DETECT POWER STORAGE ITEM

   Later we should formalize equipment subtype IDs.

   V1 supports:

   category = power

   plus common names like:
   - power station
   - battery
   - portable power
   ========================================================= */

function isPowerStorageItem(
  item: TripGearItem
) {
  if (
    item.category !== "power"
  ) {
    return false;
  }

  const name =
    item.name.toLowerCase();

  return (
    name.includes(
      "power station"
    ) ||
    name.includes(
      "portable power"
    ) ||
    name.includes(
      "battery"
    )
  );
}


/* =========================================================
   7. DETECT SOLAR ITEM
   ========================================================= */

function isSolarItem(
  item: TripGearItem
) {
  if (
    item.category !== "power"
  ) {
    return false;
  }

  return item.name
    .toLowerCase()
    .includes("solar");
}


/* =========================================================
   8. BATTERY CAPACITY

   Supported spec keys:

   batteryCapacityWh
   capacityWh
   wh

   Multiple owned battery units can add together.

   Example:
   2 × 512Wh
   = 1024Wh total energy capacity

   ========================================================= */

function calculateBatteryCapacity(
  items: TripGearItem[]
) {
  let total = 0;

  for (const item of items) {
    if (
      !isActiveGearItem(item)
    ) {
      continue;
    }

    if (
      !isPowerStorageItem(item)
    ) {
      continue;
    }

    const capacity =
      readNumber(item, [
        "batteryCapacityWh",
        "capacityWh",
        "wh",
      ]);

    const quantity =
      Math.max(
        1,
        item.quantity ?? 1
      );

    total +=
      capacity * quantity;
  }

  return total;
}


/* =========================================================
   9. CONTINUOUS AC OUTPUT

   IMPORTANT:

   Output is NOT automatically additive.

   Two separate power stations generally should not
   be treated as one combined inverter unless the system
   explicitly supports parallel operation.

   Therefore V1 takes the HIGHEST available
   single-unit AC output.

   ========================================================= */

function calculateContinuousAcOutput(
  items: TripGearItem[]
) {
  let highest = 0;

  for (const item of items) {
    if (
      !isActiveGearItem(item)
    ) {
      continue;
    }

    if (
      !isPowerStorageItem(item)
    ) {
      continue;
    }

    const output =
      readNumber(item, [
        "continuousAcOutputW",
        "continuousOutputW",
        "acOutputW",
        "outputW",
      ]);

    highest = Math.max(
      highest,
      output
    );
  }

  return highest;
}


/* =========================================================
   10. SURGE OUTPUT

   Same principle:
   use the highest single-unit surge capability.

   ========================================================= */

function calculateSurgeOutput(
  items: TripGearItem[]
) {
  let highest = 0;

  for (const item of items) {
    if (
      !isActiveGearItem(item)
    ) {
      continue;
    }

    if (
      !isPowerStorageItem(item)
    ) {
      continue;
    }

    const surge =
      readNumber(item, [
        "surgeOutputW",
        "surgeW",
        "peakOutputW",
      ]);

    const continuous =
      readNumber(item, [
        "continuousAcOutputW",
        "continuousOutputW",
        "acOutputW",
        "outputW",
      ]);

    highest = Math.max(
      highest,
      surge || continuous
    );
  }

  return highest;
}


/* =========================================================
   11. SOLAR CAPABILITY

   Two different concepts exist:

   1. solar panel production
   2. power station solar input limit

   The real system capability is constrained
   by the weaker side.

   Example:

   Panels = 600W
   Power station max input = 400W

   usable solar capability = 400W

   If only panel data exists, V1 uses panel watts.
   If only power-station input exists, V1 uses input limit.

   ========================================================= */

function calculateSolarCapability(
  items: TripGearItem[]
) {
  let totalPanelW = 0;

  let highestSolarInputW = 0;

  for (const item of items) {
    if (
      !isActiveGearItem(item)
    ) {
      continue;
    }

    if (
      isSolarItem(item)
    ) {
      const panelW =
        readNumber(item, [
          "panelW",
          "solarPanelW",
          "ratedPowerW",
          "watts",
        ]);

      totalPanelW +=
        panelW *
        Math.max(
          1,
          item.quantity ?? 1
        );
    }

    if (
      isPowerStorageItem(item)
    ) {
      const input =
        readNumber(item, [
          "maxSolarInputW",
          "solarInputW",
        ]);

      highestSolarInputW =
        Math.max(
          highestSolarInputW,
          input
        );
    }
  }

  if (
    totalPanelW > 0 &&
    highestSolarInputW > 0
  ) {
    return Math.min(
      totalPanelW,
      highestSolarInputW
    );
  }

  if (
    totalPanelW > 0
  ) {
    return totalPanelW;
  }

  return highestSolarInputW;
}


/* =========================================================
   12. AC RECHARGE CAPABILITY

   Use the fastest available single power station
   charging capability.

   ========================================================= */

function calculateAcRechargeCapability(
  items: TripGearItem[]
) {
  let highest = 0;

  for (const item of items) {
    if (
      !isActiveGearItem(item)
    ) {
      continue;
    }

    if (
      !isPowerStorageItem(item)
    ) {
      continue;
    }

    const recharge =
      readNumber(item, [
        "maxAcRechargeW",
        "acRechargeW",
        "acInputW",
      ]);

    highest = Math.max(
      highest,
      recharge
    );
  }

  return highest;
}


/* =========================================================
   13. EXISTING CAPABILITY

   Includes ACTIVE gear:

   owned
   +
   to-buy

   IMPORTANT:

   Later we can run this twice:

   - owned-only capability
   - final planned system capability

   For V1, this function analyses the active system
   as currently defined.

   ========================================================= */

export function calculateExistingPowerCapability(
  gearState: TripGearState
): ExistingPowerCapability {
  const activeItems =
    gearState.items.filter(
      isActiveGearItem
    );

  const contributingItemIds =
    activeItems
      .filter(
        (item) =>
          isPowerStorageItem(
            item
          ) ||
          isSolarItem(item)
      )
      .map(
        (item) => item.id
      );

  return {
    batteryCapacityWh:
      calculateBatteryCapacity(
        activeItems
      ),

    continuousAcOutputW:
      calculateContinuousAcOutput(
        activeItems
      ),

    surgeOutputW:
      calculateSurgeOutput(
        activeItems
      ),

    solarInputW:
      calculateSolarCapability(
        activeItems
      ),

    acRechargeW:
      calculateAcRechargeCapability(
        activeItems
      ),

    contributingItemIds,
  };
}


/* =========================================================
   14. METRIC GAP HELPER
   ========================================================= */

function createGap({
  metric,
  label,
  required,
  available,
  unit,
  reason,
}: {
  metric: PowerMetricGap["metric"];
  label: string;
  required: number;
  available: number;
  unit: "Wh" | "W";
  reason: string;
}): PowerMetricGap {
  if (
    required <= 0
  ) {
    return {
      metric,
      label,
      required: 0,
      available,
      gap: 0,
      unit,
      status:
        "not-required",
      needsPurchase: false,
      reason:
        `${label} is not required by the current trip system.`,
    };
  }

  const gap =
    Math.max(
      0,
      required -
        available
    );

  if (
    available <= 0
  ) {
    return {
      metric,
      label,
      required,
      available: 0,
      gap,
      unit,
      status: "missing",
      needsPurchase: true,
      reason,
    };
  }

  if (
    available >= required
  ) {
    return {
      metric,
      label,
      required,
      available,
      gap: 0,
      unit,
      status:
        "sufficient",
      needsPurchase: false,
      reason:
        `${label} already meets the calculated requirement.`,
    };
  }

  return {
    metric,
    label,
    required,
    available,
    gap,
    unit,
    status:
      "insufficient",
    needsPurchase: true,
    reason,
  };
}


/* =========================================================
   15. MAIN GAP ANALYSIS
   ========================================================= */

export function analyzePowerGap(
  gearState: TripGearState
): PowerGapAnalysisResult {
  const requirement =
    calculatePowerRequirement(
      gearState
    );

  const existingCapability =
    calculateExistingPowerCapability(
      gearState
    );

  const batteryGap =
    createGap({
      metric:
        "batteryCapacityWh",

      label:
        "Battery Capacity",

      required:
        requirement
          .requiredBatteryCapacityWh,

      available:
        existingCapability
          .batteryCapacityWh,

      unit: "Wh",

      reason:
        "Available battery capacity is below the stored-energy requirement for the current trip system.",
    });

  const continuousAcGap =
    createGap({
      metric:
        "continuousAcOutputW",

      label:
        "Continuous AC Output",

      required:
        requirement
          .requiredContinuousAcOutputW,

      available:
        existingCapability
          .continuousAcOutputW,

      unit: "W",

      reason:
        "Available inverter output is below the continuous AC load requirement.",
    });

  const surgeGap =
    createGap({
      metric:
        "surgeOutputW",

      label:
        "Surge Output",

      required:
        requirement
          .requiredSurgeOutputW,

      available:
        existingCapability
          .surgeOutputW,

      unit: "W",

      reason:
        "Available surge output is below the peak AC appliance requirement.",
    });

  const solarGap =
    createGap({
      metric:
        "solarInputW",

      label:
        "Solar Capability",

      required:
        requirement
          .recommendedSolarInputW,

      available:
        existingCapability
          .solarInputW,

      unit: "W",

      reason:
        "Available solar capability is below the calculated off-grid recharge target.",
    });

  const acRechargeGap =
    createGap({
      metric:
        "acRechargeW",

      label:
        "AC Recharge",

      required:
        requirement
          .recommendedAcRechargeW,

      available:
        existingCapability
          .acRechargeW,

      unit: "W",

      reason:
        "Available AC charging capability is below the recommended recovery rate.",
    });

  const gaps: PowerMetricGap[] =
    [
      batteryGap,
      continuousAcGap,
      surgeGap,
      solarGap,
      acRechargeGap,
    ];

  const missingMetrics =
    gaps.filter(
      (gap) =>
        gap.status ===
          "missing" ||
        gap.status ===
          "insufficient"
    );

  const sufficientMetrics =
    gaps.filter(
      (gap) =>
        gap.status ===
        "sufficient"
    );

  const missionCapable =
    missingMetrics.length ===
    0;

  const needsPurchase =
    gaps.some(
      (gap) =>
        gap.needsPurchase
    );

  /*
    Upgrade means:

    Some capability exists,
    but it is not enough.

    Example:

    User owns 1024Wh battery,
    but needs 1700Wh.

    That is different from owning no battery.
  */

  const needsUpgrade =
    gaps.some(
      (gap) =>
        gap.status ===
        "insufficient"
    );

  const reasons: string[] =
    [];

  if (missionCapable) {
    reasons.push(
      "The active power system meets all currently calculated technical requirements."
    );
  } else {
    reasons.push(
      `${missingMetrics.length} power requirement(s) are not yet fully satisfied.`
    );
  }

  if (
    batteryGap.status ===
    "missing"
  ) {
    reasons.push(
      "No usable battery capacity was detected in the active power system."
    );
  }

  if (
    batteryGap.status ===
    "insufficient"
  ) {
    reasons.push(
      `Existing battery capacity is short by ${batteryGap.gap} Wh.`
    );
  }

  if (
    continuousAcGap.status ===
    "insufficient"
  ) {
    reasons.push(
      `Existing continuous AC output is short by ${continuousAcGap.gap} W.`
    );
  }

  if (
    continuousAcGap.status ===
    "missing" &&
    continuousAcGap.required >
      0
  ) {
    reasons.push(
      "The trip system requires AC inverter output, but no matching AC capability was detected."
    );
  }

  if (
    solarGap.status ===
    "insufficient"
  ) {
    reasons.push(
      `Solar capability is short by ${solarGap.gap} W.`
    );
  }

  if (
    solarGap.status ===
    "missing" &&
    solarGap.required >
      0
  ) {
    reasons.push(
      "Solar is part of the planned requirement, but no usable solar capability was detected."
    );
  }

  return {
    requirement,

    existingCapability,

    gaps,

    missionCapable,

    needsPurchase,

    needsUpgrade,

    missingMetrics,

    sufficientMetrics,

    summary: {
      requiredBatteryCapacityWh:
        requirement
          .requiredBatteryCapacityWh,

      availableBatteryCapacityWh:
        existingCapability
          .batteryCapacityWh,

      batteryGapWh:
        batteryGap.gap,

      requiredContinuousAcOutputW:
        requirement
          .requiredContinuousAcOutputW,

      availableContinuousAcOutputW:
        existingCapability
          .continuousAcOutputW,

      acOutputGapW:
        continuousAcGap.gap,

      requiredSolarInputW:
        requirement
          .recommendedSolarInputW,

      availableSolarInputW:
        existingCapability
          .solarInputW,

      solarGapW:
        solarGap.gap,
    },

    reasons,
  };
}


/* =========================================================
   16. OWNED-ONLY POWER STATE

   This helper is important.

   It lets RoamLab answer:

   "What can the user already do WITHOUT buying anything?"

   TO-BUY gear is temporarily excluded.

   ========================================================= */

export function createOwnedOnlyPowerState(
  gearState: TripGearState
): TripGearState {
  return {
    ...gearState,

    items:
      gearState.items.map(
        (item) => {
          if (
            item.status ===
            "to-buy"
          ) {
            return {
              ...item,
              status:
                "not-needed" as const,
            };
          }

          return item;
        }
      ),
  };
}


/* =========================================================
   17. OWNED-ONLY GAP ANALYSIS

   This will eventually be one of the most important
   functions in the recommendation flow.

   It answers:

   "Given what the user already owns,
   what exactly is still missing?"

   ========================================================= */

export function analyzeOwnedPowerGap(
  gearState: TripGearState
) {
  const ownedOnlyState =
    createOwnedOnlyPowerState(
      gearState
    );

  /*
    IMPORTANT:

    Requirement must still be based on the intended
    final trip equipment system, NOT just owned gear.

    Example:

    User intends to buy an induction cooker.

    Even though it is not owned yet,
    its future power load must still influence the
    required Power System.

    Therefore:

    requirement
    = full intended system

    capability
    = owned gear only
  */

  const requirement =
    calculatePowerRequirement(
      gearState
    );

  const existingCapability =
    calculateExistingPowerCapability(
      ownedOnlyState
    );

  return analyzeGapFromRequirementAndCapability(
    requirement,
    existingCapability
  );
}


/* =========================================================
   18. GENERIC INTERNAL GAP ANALYSIS

   Used when Requirement and Capability come from
   different Gear States.

   This is required for:

   Intended System Requirement
          vs
   Owned Gear Capability

   ========================================================= */

function analyzeGapFromRequirementAndCapability(
  requirement: PowerRequirement,
  existingCapability:
    ExistingPowerCapability
): PowerGapAnalysisResult {
  const batteryGap =
    createGap({
      metric:
        "batteryCapacityWh",

      label:
        "Battery Capacity",

      required:
        requirement
          .requiredBatteryCapacityWh,

      available:
        existingCapability
          .batteryCapacityWh,

      unit: "Wh",

      reason:
        "Owned battery capacity is below the required stored-energy target.",
    });

  const continuousAcGap =
    createGap({
      metric:
        "continuousAcOutputW",

      label:
        "Continuous AC Output",

      required:
        requirement
          .requiredContinuousAcOutputW,

      available:
        existingCapability
          .continuousAcOutputW,

      unit: "W",

      reason:
        "Owned inverter capability is below the required continuous AC output.",
    });

  const surgeGap =
    createGap({
      metric:
        "surgeOutputW",

      label:
        "Surge Output",

      required:
        requirement
          .requiredSurgeOutputW,

      available:
        existingCapability
          .surgeOutputW,

      unit: "W",

      reason:
        "Owned surge capability is below the required peak load.",
    });

  const solarGap =
    createGap({
      metric:
        "solarInputW",

      label:
        "Solar Capability",

      required:
        requirement
          .recommendedSolarInputW,

      available:
        existingCapability
          .solarInputW,

      unit: "W",

      reason:
        "Owned solar capability is below the recommended recharge target.",
    });

  const acRechargeGap =
    createGap({
      metric:
        "acRechargeW",

      label:
        "AC Recharge",

      required:
        requirement
          .recommendedAcRechargeW,

      available:
        existingCapability
          .acRechargeW,

      unit: "W",

      reason:
        "Owned AC recharge capability is below the recommended recovery target.",
    });

  const gaps = [
    batteryGap,
    continuousAcGap,
    surgeGap,
    solarGap,
    acRechargeGap,
  ];

  const missingMetrics =
    gaps.filter(
      (gap) =>
        gap.status ===
          "missing" ||
        gap.status ===
          "insufficient"
    );

  const sufficientMetrics =
    gaps.filter(
      (gap) =>
        gap.status ===
        "sufficient"
    );

  const missionCapable =
    missingMetrics.length ===
    0;

  const needsPurchase =
    gaps.some(
      (gap) =>
        gap.needsPurchase
    );

  const needsUpgrade =
    gaps.some(
      (gap) =>
        gap.status ===
        "insufficient"
    );

  const reasons: string[] =
    [];

  if (missionCapable) {
    reasons.push(
      "The user's owned power equipment already satisfies the intended trip system."
    );
  } else {
    reasons.push(
      `${missingMetrics.length} power capability gap(s) remain after accounting for owned equipment.`
    );
  }

  for (
    const gap of missingMetrics
  ) {
    if (
      gap.available <= 0
    ) {
      reasons.push(
        `${gap.label}: no owned capability detected; ${gap.required} ${gap.unit} required.`
      );
    } else {
      reasons.push(
        `${gap.label}: ${gap.available} ${gap.unit} available, ${gap.required} ${gap.unit} required, ${gap.gap} ${gap.unit} gap remaining.`
      );
    }
  }

  return {
    requirement,

    existingCapability,

    gaps,

    missionCapable,

    needsPurchase,

    needsUpgrade,

    missingMetrics,

    sufficientMetrics,

    summary: {
      requiredBatteryCapacityWh:
        requirement
          .requiredBatteryCapacityWh,

      availableBatteryCapacityWh:
        existingCapability
          .batteryCapacityWh,

      batteryGapWh:
        batteryGap.gap,

      requiredContinuousAcOutputW:
        requirement
          .requiredContinuousAcOutputW,

      availableContinuousAcOutputW:
        existingCapability
          .continuousAcOutputW,

      acOutputGapW:
        continuousAcGap.gap,

      requiredSolarInputW:
        requirement
          .recommendedSolarInputW,

      availableSolarInputW:
        existingCapability
          .solarInputW,

      solarGapW:
        solarGap.gap,
    },

    reasons,
  };
}
