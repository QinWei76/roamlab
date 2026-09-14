import type {
  ProductCandidate,
} from "@/data/productRecommendationEngine";

import type {
  PowerRequirement,
} from "@/data/powerRequirementEngine";


/* =========================================================
   ROAMLAB POWER MISSION FILTER — V1

   PURPOSE

   This layer does NOT rank products.

   It answers only one question:

   "Can this product actually complete the mission?"

   FLOW

   Power Requirement
          ↓
   Candidate Products
          ↓
   Hard Requirement Gate
          ↓
   PASS / FAIL
          ↓
   Only PASS products may enter ranking later

   IMPORTANT

   Zero passing products is a VALID result.

   RoamLab must never force-rank an insufficient product.

   ========================================================= */


/* =========================================================
   1. HARD-GATE METRICS
   ========================================================= */

export type PowerMissionMetric =
  | "batteryCapacityWh"
  | "continuousAcOutputW"
  | "surgeOutputW"
  | "solarInputW"
  | "acRechargeW";


/* =========================================================
   2. TECHNICAL CAPABILITY

   Temporary V1 technical registry.

   Later we should move these technical specs into the
   product data itself so there is one source of truth.

   ========================================================= */

export type PowerMissionSpecs = {
  batteryCapacityWh: number;

  continuousAcOutputW: number;

  /*
    null means:

    RoamLab does not yet have sufficiently trusted
    structured data for this value.

    Unknown is NOT treated as PASS.
  */
  surgeOutputW: number | null;

  maxSolarInputW: number;

  maxAcRechargeW: number;
};


/* =========================================================
   3. INDIVIDUAL CHECK
   ========================================================= */

export type PowerMissionCheck = {
  metric: PowerMissionMetric;

  label: string;

  required: number;

  available: number | null;

  unit: "Wh" | "W";

  passed: boolean;

  known: boolean;

  gap: number | null;

  reason: string;
};


/* =========================================================
   4. PRODUCT FILTER RESULT
   ========================================================= */

export type PowerMissionCandidateResult = {
  product: ProductCandidate;

  specs: PowerMissionSpecs | null;

  missionCapable: boolean;

  checks: PowerMissionCheck[];

  failedChecks: PowerMissionCheck[];

  passedChecks: PowerMissionCheck[];

  unknownChecks: PowerMissionCheck[];

  failureReasons: string[];
};


/* =========================================================
   5. FULL FILTER RESULT
   ========================================================= */

export type PowerMissionFilterResult = {
  requirement: PowerRequirement;

  evaluatedCount: number;

  missionCapableCount: number;

  rejectedCount: number;

  missionCapableProducts:
    PowerMissionCandidateResult[];

  rejectedProducts:
    PowerMissionCandidateResult[];

  allResults:
    PowerMissionCandidateResult[];

  hasMissionCapableCandidate: boolean;

  summary: string;
};


/* =========================================================
   6. CURRENT TECHNICAL REGISTRY

   IMPORTANT:

   These values mirror the Power V2 test model we have
   already been using.

   Surge output remains null where we have not yet placed
   trusted structured surge data into the model.

   Because this is a HARD GATE:

   unknown surge capability does not automatically pass.

   ========================================================= */

const POWER_MISSION_SPECS_BY_NAME:
  Record<string, PowerMissionSpecs> = {

  "EcoFlow DELTA 3 Plus": {
    batteryCapacityWh: 1024,
    continuousAcOutputW: 1800,
    surgeOutputW: null,
    maxSolarInputW: 500,
    maxAcRechargeW: 1500,
  },

  "Jackery Explorer 1000 v2": {
    batteryCapacityWh: 1070,
    continuousAcOutputW: 1500,
    surgeOutputW: null,
    maxSolarInputW: 400,
    maxAcRechargeW: 1000,
  },

  "BLUETTI AC180": {
    batteryCapacityWh: 1152,
    continuousAcOutputW: 1800,
    surgeOutputW: null,
    maxSolarInputW: 500,
    maxAcRechargeW: 1440,
  },

  "DJI Power 1000": {
    batteryCapacityWh: 1024,
    continuousAcOutputW: 2200,
    surgeOutputW: null,
    maxSolarInputW: 400,
    maxAcRechargeW: 1200,
  },

  "Anker SOLIX C1000 Gen 2": {
    batteryCapacityWh: 1024,
    continuousAcOutputW: 2000,
    surgeOutputW: null,
    maxSolarInputW: 600,
    maxAcRechargeW: 1600,
  },

  "EcoFlow DELTA 2": {
    batteryCapacityWh: 1024,
    continuousAcOutputW: 1800,
    surgeOutputW: null,
    maxSolarInputW: 500,
    maxAcRechargeW: 1200,
  },
};


/* =========================================================
   7. GET TECHNICAL SPECS
   ========================================================= */

export function getPowerMissionSpecs(
  product: ProductCandidate
): PowerMissionSpecs | null {
  return (
    POWER_MISSION_SPECS_BY_NAME[
      product.name
    ] ?? null
  );
}


/* =========================================================
   8. GENERIC NUMERIC CHECK
   ========================================================= */

function createNumericCheck({
  metric,
  label,
  required,
  available,
  unit,
}: {
  metric: PowerMissionMetric;

  label: string;

  required: number;

  available: number | null;

  unit: "Wh" | "W";
}): PowerMissionCheck {

  /*
    Requirement = 0 means the mission does not require
    this capability.

    Therefore it automatically passes.
  */

  if (required <= 0) {
    return {
      metric,
      label,
      required,
      available,
      unit,
      passed: true,
      known: true,
      gap: 0,
      reason:
        `${label} is not required for this mission.`,
    };
  }


  /*
    Unknown capability.

    Hard-gate logic must NOT assume that an unknown
    specification is sufficient.
  */

  if (available === null) {
    return {
      metric,
      label,
      required,
      available,
      unit,
      passed: false,
      known: false,
      gap: null,
      reason:
        `${label} cannot be verified because the candidate's capability is currently unknown.`,
    };
  }


  const passed =
    available >= required;

  const gap =
    Math.max(
      0,
      required - available
    );


  return {
    metric,
    label,
    required,
    available,
    unit,
    passed,
    known: true,
    gap,

    reason:
      passed
        ? `${label} meets the mission requirement.`
        : `${label} is short by ${gap} ${unit}.`,
  };
}


/* =========================================================
   9. EVALUATE ONE PRODUCT
   ========================================================= */

export function evaluatePowerMissionCandidate(
  product: ProductCandidate,
  requirement: PowerRequirement
): PowerMissionCandidateResult {

  const specs =
    getPowerMissionSpecs(product);


  /*
    No technical registry = automatic rejection.

    We cannot claim Mission Capable without technical
    capability data.
  */

  if (!specs) {
    const missingDataCheck:
      PowerMissionCheck = {
      metric:
        "batteryCapacityWh",

      label:
        "Technical Specification Data",

      required: 1,

      available: null,

      unit: "Wh",

      passed: false,

      known: false,

      gap: null,

      reason:
        "RoamLab does not yet have sufficient structured technical data to verify this candidate.",
    };


    return {
      product,

      specs: null,

      missionCapable: false,

      checks: [
        missingDataCheck,
      ],

      failedChecks: [
        missingDataCheck,
      ],

      passedChecks: [],

      unknownChecks: [
        missingDataCheck,
      ],

      failureReasons: [
        missingDataCheck.reason,
      ],
    };
  }


  const checks:
    PowerMissionCheck[] = [

    createNumericCheck({
      metric:
        "batteryCapacityWh",

      label:
        "Battery Capacity",

      required:
        requirement
          .requiredBatteryCapacityWh,

      available:
        specs
          .batteryCapacityWh,

      unit: "Wh",
    }),


    createNumericCheck({
      metric:
        "continuousAcOutputW",

      label:
        "Continuous AC Output",

      required:
        requirement
          .requiredContinuousAcOutputW,

      available:
        specs
          .continuousAcOutputW,

      unit: "W",
    }),


    createNumericCheck({
      metric:
        "surgeOutputW",

      label:
        "Surge Output",

      required:
        requirement
          .requiredSurgeOutputW,

      available:
        specs
          .surgeOutputW,

      unit: "W",
    }),


    createNumericCheck({
      metric:
        "solarInputW",

      label:
        "Solar Input",

      required:
        requirement
          .recommendedSolarInputW,

      available:
        specs
          .maxSolarInputW,

      unit: "W",
    }),


    createNumericCheck({
      metric:
        "acRechargeW",

      label:
        "AC Recharge",

      required:
        requirement
          .recommendedAcRechargeW,

      available:
        specs
          .maxAcRechargeW,

      unit: "W",
    }),
  ];


  const failedChecks =
    checks.filter(
      (check) =>
        !check.passed
    );


  const passedChecks =
    checks.filter(
      (check) =>
        check.passed
    );


  const unknownChecks =
    checks.filter(
      (check) =>
        !check.known
    );


  const missionCapable =
    failedChecks.length === 0;


  return {
    product,

    specs,

    missionCapable,

    checks,

    failedChecks,

    passedChecks,

    unknownChecks,

    failureReasons:
      failedChecks.map(
        (check) =>
          check.reason
      ),
  };
}


/* =========================================================
   10. FILTER PRODUCT POOL
   ========================================================= */

export function filterPowerMissionCandidates(
  requirement: PowerRequirement,
  products: ProductCandidate[]
): PowerMissionFilterResult {

  const allResults =
    products.map(
      (product) =>
        evaluatePowerMissionCandidate(
          product,
          requirement
        )
    );


  const missionCapableProducts =
    allResults.filter(
      (result) =>
        result.missionCapable
    );


  const rejectedProducts =
    allResults.filter(
      (result) =>
        !result.missionCapable
    );


  const hasMissionCapableCandidate =
    missionCapableProducts.length > 0;


  let summary: string;


  if (
    products.length === 0
  ) {
    summary =
      "No candidate products were supplied to the Power Mission Filter.";
  }

  else if (
    missionCapableProducts.length ===
    0
  ) {
    summary =
      `0 of ${products.length} candidate Power Stations satisfy all current mission requirements. RoamLab should not force a recommendation from this product pool.`;
  }

  else {
    summary =
      `${missionCapableProducts.length} of ${products.length} candidate Power Stations satisfy all current mission requirements and may proceed to professional ranking.`;
  }


  return {
    requirement,

    evaluatedCount:
      products.length,

    missionCapableCount:
      missionCapableProducts.length,

    rejectedCount:
      rejectedProducts.length,

    missionCapableProducts,

    rejectedProducts,

    allResults,

    hasMissionCapableCandidate,

    summary,
  };
}


/* =========================================================
   11. STRICT HARD-GATE HELPER

   Later the ranking engine should receive ONLY this list.

   Example:

   const filtered =
     filterPowerMissionCandidates(...)

   const productsForRanking =
     getMissionCapablePowerProducts(filtered)

   ========================================================= */

export function getMissionCapablePowerProducts(
  result: PowerMissionFilterResult
): ProductCandidate[] {

  return (
    result
      .missionCapableProducts
      .map(
        (item) =>
          item.product
      )
  );
}


/* =========================================================
   12. SHOULD RANK PRODUCTS?

   Ranking should NEVER run if the hard gate produces
   zero candidates.

   ========================================================= */

export function shouldRankPowerProducts(
  result: PowerMissionFilterResult
) {
  return (
    result
      .missionCapableCount >
    0
  );
}


/* =========================================================
   13. GET MOST COMMON FAILURE METRICS

   Useful later for UI.

   Example:

   "Current product pool is mainly failing Battery Capacity."

   ========================================================= */

export function getPowerMissionFailureCounts(
  result: PowerMissionFilterResult
) {
  const counts:
    Record<
      PowerMissionMetric,
      number
    > = {

    batteryCapacityWh: 0,

    continuousAcOutputW: 0,

    surgeOutputW: 0,

    solarInputW: 0,

    acRechargeW: 0,
  };


  for (
    const candidate of
      result.rejectedProducts
  ) {
    for (
      const failure of
        candidate.failedChecks
    ) {
      counts[
        failure.metric
      ] += 1;
    }
  }


  return counts;
}


/* =========================================================
   14. FIND CLOSEST REJECTED CANDIDATES

   IMPORTANT:

   These are NOT recommendations.

   They are diagnostic candidates only.

   This allows RoamLab to explain:

   "This product is close, but still fails Battery Capacity."

   Never send these directly into affiliate recommendation.

   ========================================================= */

export function getClosestRejectedPowerCandidates(
  result: PowerMissionFilterResult,
  limit = 3
) {
  return [
    ...result.rejectedProducts,
  ]
    .sort(
      (a, b) => {

        /*
          Fewer failed hard requirements
          is considered "closer".
        */

        if (
          a.failedChecks.length !==
          b.failedChecks.length
        ) {
          return (
            a.failedChecks.length -
            b.failedChecks.length
          );
        }


        /*
          If failure count is equal,
          fewer unknown specifications
          is preferred for diagnostics.
        */

        return (
          a.unknownChecks.length -
          b.unknownChecks.length
        );
      }
    )
    .slice(
      0,
      limit
    );
}
