import type {
  TripGearItem,
  TripGearState,
} from "@/types/gearSystem";

import {
  analyzeOwnedPowerGap,
  type PowerGapAnalysisResult,
} from "@/data/powerGapAnalysis";

import {
  calculatePowerRequirement,
  type PowerRequirement,
} from "@/data/powerRequirementEngine";


/* =========================================================
   ROAMLAB POWER ACTION ENGINE — V1

   PURPOSE

   This layer does NOT recommend products.

   It decides what the user should do next.

   FLOW

   Intended Gear System
          ↓
   Power Requirement
          ↓
   Owned Capability
          ↓
   Power Gap
          ↓
   Action Decision

   POSSIBLE ACTIONS

   KEEP
   RECONFIGURE
   SUPPLEMENT
   UPGRADE

   ========================================================= */


/* =========================================================
   1. ACTION TYPES
   ========================================================= */

export type PowerAction =
  | "keep"
  | "reconfigure"
  | "supplement"
  | "upgrade";


export type PowerActionConfidence =
  | "high"
  | "medium"
  | "low";


/* =========================================================
   2. RECONFIGURATION OPTION

   Represents a possible change to the planned gear
   system that could reduce Power requirements.

   Example:

   Induction Cooker
        ↓
   Propane Stove

   This may reduce:

   - AC output requirement
   - battery requirement
   - recharge requirement
   - solar requirement

   ========================================================= */

export type PowerReconfigurationOption = {
  id: string;

  sourceItemId: string;

  sourceItemName: string;

  action:
    | "replace-item"
    | "remove-item"
    | "change-power-source";

  alternativeName: string;

  description: string;

  estimatedRequirement:
    PowerRequirement;

  batteryReductionWh: number;

  acOutputReductionW: number;

  solarReductionW: number;

  becomesMissionCapableWithOwnedGear:
    boolean;

  score: number;
};


/* =========================================================
   3. ACTION RESULT
   ========================================================= */

export type PowerActionResult = {
  action: PowerAction;

  confidence:
    PowerActionConfidence;

  purchaseRequired: boolean;

  productFilteringRequired: boolean;

  currentGap:
    PowerGapAnalysisResult;

  reconfigurationOptions:
    PowerReconfigurationOption[];

  bestReconfiguration:
    PowerReconfigurationOption | null;

  reasons: string[];

  summary: string;
};


/* =========================================================
   4. AC APPLIANCE DETECTION

   These are high-power appliances that can create
   a major inverter requirement.

   Later this should become structured product metadata.

   For V1 we support common names.

   ========================================================= */

const HIGH_POWER_AC_KEYWORDS = [
  "induction",
  "electric cooker",
  "electric stove",
  "electric kettle",
  "kettle",
  "microwave",
  "coffee maker",
  "hair dryer",
  "portable ac",
  "air conditioner",
  "electric heater",
  "toaster",
];


/* =========================================================
   5. CHECK IF ITEM IS HIGH-POWER AC
   ========================================================= */

function isHighPowerAcItem(
  item: TripGearItem
) {
  const powerType =
    item.specs?.powerType;

  if (
    typeof powerType ===
      "string" &&
    powerType.toLowerCase() ===
      "ac"
  ) {
    const watts =
      item.effects?.powerLoad
        ?.watts ?? 0;

    if (watts >= 1000) {
      return true;
    }
  }

  const name =
    item.name.toLowerCase();

  return HIGH_POWER_AC_KEYWORDS.some(
    (keyword) =>
      name.includes(keyword)
  );
}


/* =========================================================
   6. DETECT COOKING ITEM
   ========================================================= */

function isCookingItem(
  item: TripGearItem
) {
  return (
    item.category ===
    "cooking"
  );
}


/* =========================================================
   7. CREATE RECONFIGURED STATE

   For V1:

   If a planned high-power electric cooking item exists,
   simulate replacing it with propane cooking.

   IMPORTANT:

   This is only a simulation.

   We are NOT changing the user's real Gear State.

   ========================================================= */

function createPropaneAlternativeState(
  gearState: TripGearState,
  sourceItem: TripGearItem
): TripGearState {
  const replacement:
    TripGearItem = {
      id:
        `${sourceItem.id}-propane-alternative`,

      name:
        "Propane Stove",

      category:
        "cooking",

      status:
        sourceItem.status,

      priority:
        sourceItem.priority,

      quantity: 1,

      effects: {
        fuelLoad: {
          fuelType:
            "propane",

          amount: 1,

          unit: "lb",
        },

        satisfiesCategories: [
          "cooking",
        ],
      },
    };

  return {
    ...gearState,

    items:
      gearState.items.map(
        (item) =>
          item.id ===
          sourceItem.id
            ? replacement
            : item
      ),
  };
}


/* =========================================================
   8. CHECK RECONFIGURED SYSTEM AGAINST OWNED CAPABILITY

   We need to know whether changing the planned gear
   would allow the user's CURRENT owned Power system
   to satisfy the new requirement.

   ========================================================= */

function isRequirementCoveredByOwnedCapability(
  requirement:
    PowerRequirement,

  originalGap:
    PowerGapAnalysisResult
) {
  const owned =
    originalGap
      .existingCapability;

  const batteryOk =
    owned.batteryCapacityWh >=
    requirement
      .requiredBatteryCapacityWh;

  const acOk =
    owned.continuousAcOutputW >=
    requirement
      .requiredContinuousAcOutputW;

  const surgeOk =
    owned.surgeOutputW >=
    requirement
      .requiredSurgeOutputW;

  const solarOk =
    requirement
      .recommendedSolarInputW <=
      0 ||
    owned.solarInputW >=
      requirement
        .recommendedSolarInputW;

  const rechargeOk =
    requirement
      .recommendedAcRechargeW <=
      0 ||
    owned.acRechargeW >=
      requirement
        .recommendedAcRechargeW;

  return (
    batteryOk &&
    acOk &&
    surgeOk &&
    solarOk &&
    rechargeOk
  );
}


/* =========================================================
   9. SCORE RECONFIGURATION

   V1 heuristic.

   Higher score means the alternative removes more
   system pressure and is more likely to avoid a purchase.

   This is NOT product ranking.

   ========================================================= */

function scoreReconfiguration({
  batteryReductionWh,
  acOutputReductionW,
  solarReductionW,
  becomesMissionCapable,
}: {
  batteryReductionWh: number;
  acOutputReductionW: number;
  solarReductionW: number;
  becomesMissionCapable: boolean;
}) {
  let score = 0;

  if (
    becomesMissionCapable
  ) {
    score += 100;
  }

  score +=
    Math.min(
      30,
      batteryReductionWh /
        50
    );

  score +=
    Math.min(
      30,
      acOutputReductionW /
        100
    );

  score +=
    Math.min(
      10,
      solarReductionW /
        50
    );

  return Math.round(
    score * 10
  ) / 10;
}


/* =========================================================
   10. FIND RECONFIGURATION OPTIONS
   ========================================================= */

function findReconfigurationOptions(
  gearState: TripGearState,
  currentGap:
    PowerGapAnalysisResult
): PowerReconfigurationOption[] {
  const options:
    PowerReconfigurationOption[] =
    [];

  const currentRequirement =
    currentGap.requirement;

  const candidateItems =
    gearState.items.filter(
      (item) =>
        item.status !==
          "not-needed" &&
        isCookingItem(item) &&
        isHighPowerAcItem(item)
    );

  for (
    const item of candidateItems
  ) {
    const alternativeState =
      createPropaneAlternativeState(
        gearState,
        item
      );

    const alternativeRequirement =
      calculatePowerRequirement(
        alternativeState
      );

    const batteryReductionWh =
      Math.max(
        0,
        currentRequirement
          .requiredBatteryCapacityWh -
          alternativeRequirement
            .requiredBatteryCapacityWh
      );

    const acOutputReductionW =
      Math.max(
        0,
        currentRequirement
          .requiredContinuousAcOutputW -
          alternativeRequirement
            .requiredContinuousAcOutputW
      );

    const solarReductionW =
      Math.max(
        0,
        currentRequirement
          .recommendedSolarInputW -
          alternativeRequirement
            .recommendedSolarInputW
      );

    const becomesMissionCapable =
      isRequirementCoveredByOwnedCapability(
        alternativeRequirement,
        currentGap
      );

    const score =
      scoreReconfiguration({
        batteryReductionWh,
        acOutputReductionW,
        solarReductionW,
        becomesMissionCapable,
      });

    options.push({
      id:
        `${item.id}-to-propane`,

      sourceItemId:
        item.id,

      sourceItemName:
        item.name,

      action:
        "replace-item",

      alternativeName:
        "Propane Stove",

      description:
        `Replace ${item.name} with propane cooking to reduce battery and AC inverter requirements.`,

      estimatedRequirement:
        alternativeRequirement,

      batteryReductionWh,

      acOutputReductionW,

      solarReductionW,

      becomesMissionCapableWithOwnedGear:
        becomesMissionCapable,

      score,
    });
  }

  return options.sort(
    (a, b) =>
      b.score - a.score
  );
}


/* =========================================================
   11. CAN GAP BE SUPPLEMENTED?

   Not every capability can safely be treated as additive.

   Examples:

   Battery energy:
   sometimes supplementable.

   Solar panels:
   often supplementable within controller limits.

   AC inverter output:
   normally NOT additive unless hardware explicitly
   supports parallel operation.

   Therefore V1 is conservative.

   ========================================================= */

function canUseSupplement(
  gap:
    PowerGapAnalysisResult
) {
  const unresolved =
    gap.missingMetrics;

  if (
    unresolved.length === 0
  ) {
    return false;
  }

  /*
    Continuous AC Output is a core single-device
    capability in V1.

    If it is insufficient, we do NOT assume that
    adding another Power Station will combine inverter
    output.

    Therefore this pushes the decision toward UPGRADE.
  */

  const acOutputGap =
    unresolved.find(
      (item) =>
        item.metric ===
        "continuousAcOutputW"
    );

  if (
    acOutputGap &&
    acOutputGap.required > 0
  ) {
    return false;
  }

  /*
    Surge capability follows the same conservative rule.
  */

  const surgeGap =
    unresolved.find(
      (item) =>
        item.metric ===
        "surgeOutputW"
    );

  if (
    surgeGap &&
    surgeGap.required > 0
  ) {
    return false;
  }

  /*
    Remaining gaps may potentially be supplemented:

    - battery energy
    - solar
    - recharge support

    Exact hardware compatibility will be checked later.
  */

  return true;
}


/* =========================================================
   12. SHOULD RECONFIGURATION BE PREFERRED?

   A reconfiguration becomes especially valuable when:

   - it makes the existing owned system mission-capable
   - it removes a major AC requirement
   - it avoids unnecessary hardware purchase

   ========================================================= */

function shouldPreferReconfiguration(
  option:
    PowerReconfigurationOption | null
) {
  if (!option) {
    return false;
  }

  if (
    option
      .becomesMissionCapableWithOwnedGear
  ) {
    return true;
  }

  /*
    Even if the alternative does not solve every gap,
    removing a very large AC requirement can still be
    strategically meaningful.

    For V1 we require at least 1000W reduction.
  */

  if (
    option.acOutputReductionW >=
    1000
  ) {
    return true;
  }

  return false;
}


/* =========================================================
   13. CONFIDENCE
   ========================================================= */

function determineConfidence(
  action: PowerAction,
  gap:
    PowerGapAnalysisResult,
  bestReconfiguration:
    PowerReconfigurationOption | null
): PowerActionConfidence {
  if (
    action === "keep" &&
    gap.missionCapable
  ) {
    return "high";
  }

  if (
    action ===
      "reconfigure" &&
    bestReconfiguration
      ?.becomesMissionCapableWithOwnedGear
  ) {
    return "high";
  }

  if (
    action ===
      "upgrade" &&
    gap.missingMetrics.some(
      (item) =>
        item.metric ===
          "continuousAcOutputW" ||
        item.metric ===
          "surgeOutputW"
    )
  ) {
    return "high";
  }

  return "medium";
}


/* =========================================================
   14. MAIN ACTION ENGINE
   ========================================================= */

export function determinePowerAction(
  gearState: TripGearState
): PowerActionResult {
  const currentGap =
    analyzeOwnedPowerGap(
      gearState
    );

  /* =======================================================
     ACTION 1 — KEEP

     This must always be checked first.

     If owned gear already satisfies the mission,
     stop the purchase path.

     ======================================================= */

  if (
    currentGap.missionCapable
  ) {
    return {
      action: "keep",

      confidence: "high",

      purchaseRequired: false,

      productFilteringRequired:
        false,

      currentGap,

      reconfigurationOptions:
        [],

      bestReconfiguration:
        null,

      reasons: [
        "The user's owned power system already satisfies the calculated trip requirement.",
        "No Power Station purchase is required for the current mission.",
        "RoamLab should keep the current system instead of recommending duplicate equipment.",
      ],

      summary:
        "Keep the current power system. No purchase is required.",
    };
  }


  /* =======================================================
     SEARCH FOR LOWER-COST SYSTEM CHANGES
     ======================================================= */

  const reconfigurationOptions =
    findReconfigurationOptions(
      gearState,
      currentGap
    );

  const bestReconfiguration =
    reconfigurationOptions[0] ??
    null;


  /* =======================================================
     ACTION 2 — RECONFIGURE

     Before recommending larger hardware,
     ask whether the intended system itself can be
     changed intelligently.

     ======================================================= */

  if (
    shouldPreferReconfiguration(
      bestReconfiguration
    )
  ) {
    const confidence =
      determineConfidence(
        "reconfigure",
        currentGap,
        bestReconfiguration
      );

    return {
      action:
        "reconfigure",

      confidence,

      purchaseRequired:
        !bestReconfiguration
          ?.becomesMissionCapableWithOwnedGear,

      productFilteringRequired:
        false,

      currentGap,

      reconfigurationOptions,

      bestReconfiguration,

      reasons: [
        `The current system has ${currentGap.missingMetrics.length} unresolved power capability gap(s).`,
        `${bestReconfiguration?.sourceItemName} creates a major electrical requirement.`,
        `Changing to ${bestReconfiguration?.alternativeName} could reduce battery requirement by approximately ${bestReconfiguration?.batteryReductionWh} Wh and AC output requirement by approximately ${bestReconfiguration?.acOutputReductionW} W.`,
        bestReconfiguration
          ?.becomesMissionCapableWithOwnedGear
          ? "After this system change, the user's existing power equipment is estimated to satisfy the mission."
          : "This change reduces system pressure, but additional capability may still be required.",
      ],

      summary:
        bestReconfiguration
          ?.becomesMissionCapableWithOwnedGear
          ? `Reconfigure the system before buying a larger Power Station. Replacing ${bestReconfiguration.sourceItemName} with ${bestReconfiguration.alternativeName} may allow the owned power system to complete the mission.`
          : `Consider reconfiguring ${bestReconfiguration?.sourceItemName} before upgrading the Power Station.`,
    };
  }


  /* =======================================================
     ACTION 3 — SUPPLEMENT

     Use only when the missing capabilities can
     reasonably be added without replacing the core
     inverter system.

     ======================================================= */

  if (
    canUseSupplement(
      currentGap
    )
  ) {
    const confidence =
      determineConfidence(
        "supplement",
        currentGap,
        bestReconfiguration
      );

    return {
      action:
        "supplement",

      confidence,

      purchaseRequired: true,

      productFilteringRequired:
        true,

      currentGap,

      reconfigurationOptions,

      bestReconfiguration,

      reasons: [
        "The owned system does not fully satisfy the mission.",
        "The remaining gaps do not require RoamLab to assume additive AC inverter output.",
        "A compatible supplemental solution may close the remaining capability gap without replacing the entire power system.",
      ],

      summary:
        "Supplement the existing power system rather than replacing it completely.",
    };
  }


  /* =======================================================
     ACTION 4 — UPGRADE

     Core single-device capability is insufficient.

     Typical example:

     Required AC:
     2200W

     Owned:
     1800W

     We cannot safely assume another separate Power Station
     makes the original inverter become 2200W.

     Therefore recommend an upgrade path.

     ======================================================= */

  const confidence =
    determineConfidence(
      "upgrade",
      currentGap,
      bestReconfiguration
    );

  return {
    action: "upgrade",

    confidence,

    purchaseRequired: true,

    productFilteringRequired:
      true,

    currentGap,

    reconfigurationOptions,

    bestReconfiguration,

    reasons: [
      "The owned power system does not satisfy all mission requirements.",
      "At least one core capability cannot safely be treated as additive.",
      "A higher-capability main Power Station or a manufacturer-supported expandable system should be evaluated.",
    ],

    summary:
      "Upgrade the main power system to meet the remaining mission requirements.",
  };
}


/* =========================================================
   15. SHORT ACTION LABEL

   Useful later for UI.

   ========================================================= */

export function getPowerActionLabel(
  action: PowerAction
) {
  switch (action) {
    case "keep":
      return "KEEP CURRENT SYSTEM";

    case "reconfigure":
      return "RECONFIGURE SYSTEM";

    case "supplement":
      return "SUPPLEMENT SYSTEM";

    case "upgrade":
      return "UPGRADE SYSTEM";
  }
}


/* =========================================================
   16. PURCHASE PATH CHECK

   Useful later before Product Recommendation.

   ========================================================= */

export function shouldEnterPowerProductRecommendation(
  result:
    PowerActionResult
) {
  return (
    result.purchaseRequired &&
    result.productFilteringRequired
  );
}
