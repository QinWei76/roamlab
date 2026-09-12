import type {
  AdventureProfile,
  ProductCandidate,
} from "@/data/productRecommendationEngine";

/* =========================================================
   ROAMLAB POWER RECOMMENDATION MODEL — V2

   Purpose:
   Convert an adventure profile into real power requirements,
   then compare each power station against those requirements.

   This is the first category-specific recommendation model.
   ========================================================= */

export type PowerRequirement = {
  targetCapacityWh: number;
  minimumAcOutputW: number;
  targetSolarInputW: number;
  targetAcRechargeW: number;
  maxRecommendedWeightKg: number;
  targetCycleLife: number;
  remoteReservePercent: number;
};

export type PowerProductSpecs = {
  capacityWh: number;
  continuousOutputW: number;
  maxSolarInputW: number;
  maxAcRechargeW: number;
  weightKg: number;
  cycleLife: number;
};

export type PowerScenarioBreakdown = {
  capacityFit: number;
  outputFit: number;
  solarFit: number;
  rechargeFit: number;
  portabilityFit: number;
  cycleLifeFit: number;
};

export type PowerScenarioResult = {
  scenarioFit: number;
  requirement: PowerRequirement;
  breakdown: PowerScenarioBreakdown;
};

/* =========================================================
   VERIFIED / REFERENCE PRODUCT SPECS

   These are separated from the generic product database
   because Power requires category-specific technical fields.

   Later we can move these into:
   src/data/products/powerProducts.ts

   For now we keep V2 isolated so we do not break V1.
   ========================================================= */

export const powerProductSpecs: Record<
  string,
  PowerProductSpecs
> = {
  "ecoflow-delta-3-plus": {
    capacityWh: 1024,
    continuousOutputW: 1800,
    maxSolarInputW: 500,
    maxAcRechargeW: 1500,
    weightKg: 12.5,
    cycleLife: 4000,
  },

  "jackery-explorer-1000-v2": {
    capacityWh: 1070,
    continuousOutputW: 1500,
    maxSolarInputW: 400,
    maxAcRechargeW: 1000,
    weightKg: 10.8,
    cycleLife: 4000,
  },

  "bluetti-ac180": {
    capacityWh: 1152,
    continuousOutputW: 1800,
    maxSolarInputW: 500,
    maxAcRechargeW: 1440,
    weightKg: 16.0,
    cycleLife: 3500,
  },

  "dji-power-1000": {
    capacityWh: 1024,
    continuousOutputW: 2200,

    /*
      One DJI MPPT module supports up to 400W.
      Additional modules/accessories can expand solar input,
      but for conservative comparison we use 400W here.
    */
    maxSolarInputW: 400,

    maxAcRechargeW: 1200,
    weightKg: 13.0,
    cycleLife: 4000,
  },

  "anker-solix-c1000-gen2": {
    capacityWh: 1024,
    continuousOutputW: 2000,
    maxSolarInputW: 600,
    maxAcRechargeW: 1600,
    weightKg: 11.3,
    cycleLife: 4000,
  },

  "ecoflow-delta-2": {
    capacityWh: 1024,
    continuousOutputW: 1800,
    maxSolarInputW: 500,
    maxAcRechargeW: 1200,
    weightKg: 12.0,
    cycleLife: 3000,
  },
};

/* =========================================================
   HELPERS
   ========================================================= */

function clamp(
  value: number,
  min = 0,
  max = 100
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function round1(value: number) {
  return Number(value.toFixed(1));
}

function ratioScore(
  actual: number,
  required: number
) {
  if (required <= 0) {
    return 100;
  }

  return clamp(
    (actual / required) * 100
  );
}

/* =========================================================
   1. POWER REQUIREMENT ENGINE

   Converts:
   vehicle
   trip
   crew
   people
   duration

   into actual technical targets.
   ========================================================= */

export function calculatePowerRequirement(
  profile: AdventureProfile
): PowerRequirement {
  const {
    vehicle,
    trip,
    people,
    duration,
  } = profile;

  /* -------------------------------------------------------
     BASE ENERGY REQUIREMENT

     This is not intended to mean:
     "You consume the full amount every day."

     Instead it represents the recommended portable
     battery capacity for this adventure profile,
     assuming periodic vehicle / solar recharging.
     ------------------------------------------------------- */

  const durationCapacity: Record<
    AdventureProfile["duration"],
    number
  > = {
    overnight: 650,
    weekend: 850,
    "multi-day": 1050,
    extended: 1300,
  };

  let capacity =
    durationCapacity[duration] ?? 850;

  /* -------------------------------------------------------
     CREW LOAD

     More people normally means:
     more phones
     more lights
     more camera devices
     larger fridge demand
     more charging cycles
     ------------------------------------------------------- */

  const extraPeople =
    Math.max(0, people - 2);

  capacity += extraPeople * 80;

  /* -------------------------------------------------------
     TRIP STYLE MULTIPLIER
     ------------------------------------------------------- */

  if (trip === "remote") {
    capacity *= 1.15;
  }

  if (trip === "basecamp") {
    capacity *= 1.1;
  }

  if (trip === "weekend") {
    capacity *= 0.95;
  }

  /* -------------------------------------------------------
     REMOTE RESERVE

     Remote trips need more safety margin because access
     to shore power / replacement equipment is lower.
     ------------------------------------------------------- */

  const remoteReservePercent =
    trip === "remote" ? 25 : 10;

  /* -------------------------------------------------------
     AC OUTPUT REQUIREMENT
     ------------------------------------------------------- */

  let minimumAcOutputW = 1500;

  if (trip === "basecamp") {
    minimumAcOutputW = 1600;
  }

  if (trip === "remote") {
    minimumAcOutputW = 1800;
  }

  if (
    people >= 5 &&
    trip === "remote"
  ) {
    minimumAcOutputW = 1800;
  }

  /* -------------------------------------------------------
     SOLAR INPUT REQUIREMENT
     ------------------------------------------------------- */

  let targetSolarInputW = 300;

  if (duration === "overnight") {
    targetSolarInputW = 200;
  }

  if (
    duration === "multi-day"
  ) {
    targetSolarInputW = 400;
  }

  if (duration === "extended") {
    targetSolarInputW = 500;
  }

  if (trip === "remote") {
    targetSolarInputW =
      Math.max(
        targetSolarInputW,
        500
      );
  }

  /* -------------------------------------------------------
     AC RECHARGE REQUIREMENT
     ------------------------------------------------------- */

  let targetAcRechargeW = 900;

  if (
    duration === "multi-day" ||
    duration === "extended"
  ) {
    targetAcRechargeW = 1200;
  }

  if (trip === "remote") {
    targetAcRechargeW =
      Math.max(
        targetAcRechargeW,
        1200
      );
  }

  /* -------------------------------------------------------
     VEHICLE WEIGHT / PORTABILITY TARGET
     ------------------------------------------------------- */

  const vehicleWeightLimits: Record<
    AdventureProfile["vehicle"],
    number
  > = {
    city: 11.5,
    crossover: 14,
    suv: 16,
    truck: 18,
    van: 18,
  };

  const maxRecommendedWeightKg =
    vehicleWeightLimits[vehicle] ??
    14;

  /* -------------------------------------------------------
     BATTERY LONGEVITY TARGET
     ------------------------------------------------------- */

  let targetCycleLife = 3000;

  if (
    trip === "remote" ||
    duration === "multi-day" ||
    duration === "extended"
  ) {
    targetCycleLife = 3500;
  }

  return {
    targetCapacityWh:
      Math.round(capacity),

    minimumAcOutputW,

    targetSolarInputW,

    targetAcRechargeW,

    maxRecommendedWeightKg,

    targetCycleLife,

    remoteReservePercent,
  };
}

/* =========================================================
   2. PORTABILITY MODEL
   ========================================================= */

function calculatePortabilityFit(
  weightKg: number,
  maxRecommendedWeightKg: number
) {
  if (
    weightKg <=
    maxRecommendedWeightKg
  ) {
    /*
      Being lighter than the target is rewarded,
      but not excessively.
    */

    const margin =
      maxRecommendedWeightKg -
      weightKg;

    return clamp(
      92 + margin * 2,
      0,
      100
    );
  }

  /*
    Penalize overweight products progressively.
  */

  const overBy =
    weightKg -
    maxRecommendedWeightKg;

  const penalty =
    overBy * 8;

  return clamp(
    92 - penalty,
    40,
    100
  );
}

/* =========================================================
   3. POWER SCENARIO FIT

   Unlike V1, this is NOT:
   suitableTrips includes "remote" → 100

   It compares actual technical capability
   against calculated requirements.
   ========================================================= */

export function calculatePowerScenarioFit(
  product: ProductCandidate,
  profile: AdventureProfile
): PowerScenarioResult {
  const requirement =
    calculatePowerRequirement(profile);

  const specs =
    powerProductSpecs[product.id];

  /*
    If we do not yet have technical specs for a product,
    do not pretend we can score it professionally.
  */

  if (!specs) {
    return {
      scenarioFit: 0,

      requirement,

      breakdown: {
        capacityFit: 0,
        outputFit: 0,
        solarFit: 0,
        rechargeFit: 0,
        portabilityFit: 0,
        cycleLifeFit: 0,
      },
    };
  }

  const capacityFit =
    ratioScore(
      specs.capacityWh,
      requirement.targetCapacityWh
    );

  const outputFit =
    ratioScore(
      specs.continuousOutputW,
      requirement.minimumAcOutputW
    );

  const solarFit =
    ratioScore(
      specs.maxSolarInputW,
      requirement.targetSolarInputW
    );

  const rechargeFit =
    ratioScore(
      specs.maxAcRechargeW,
      requirement.targetAcRechargeW
    );

  const portabilityFit =
    calculatePortabilityFit(
      specs.weightKg,
      requirement.maxRecommendedWeightKg
    );

  const cycleLifeFit =
    ratioScore(
      specs.cycleLife,
      requirement.targetCycleLife
    );

  /* =======================================================
     POWER-SPECIFIC WEIGHTS

     Capacity matters most.

     Output + solar capability are especially important
     in remote / multi-day vehicle travel.

     Portability matters, but should not overpower
     reliability or actual capability.
     ======================================================= */

  const scenarioFit =
    capacityFit * 0.3 +
    outputFit * 0.2 +
    solarFit * 0.15 +
    rechargeFit * 0.1 +
    portabilityFit * 0.1 +
    cycleLifeFit * 0.15;

  return {
    scenarioFit:
      round1(scenarioFit),

    requirement,

    breakdown: {
      capacityFit:
        round1(capacityFit),

      outputFit:
        round1(outputFit),

      solarFit:
        round1(solarFit),

      rechargeFit:
        round1(rechargeFit),

      portabilityFit:
        round1(portabilityFit),

      cycleLifeFit:
        round1(cycleLifeFit),
    },
  };
}

/* =========================================================
   4. HUMAN-READABLE POWER REASON

   This will later help explain recommendations
   on the real product recommendation page.
   ========================================================= */

export function buildPowerScenarioReason(
  product: ProductCandidate,
  profile: AdventureProfile
) {
  const result =
    calculatePowerScenarioFit(
      product,
      profile
    );

  const specs =
    powerProductSpecs[product.id];

  if (!specs) {
    return (
      `${product.name} does not yet have enough ` +
      `verified technical data for a Power V2 score.`
    );
  }

  const r = result.requirement;

  return (
    `${product.name} provides ` +
    `${specs.capacityWh}Wh capacity, ` +
    `${specs.continuousOutputW}W continuous AC output, ` +
    `and up to ${specs.maxSolarInputW}W solar input. ` +
    `For this adventure profile, RoamLab targets approximately ` +
    `${r.targetCapacityWh}Wh capacity, ` +
    `${r.minimumAcOutputW}W AC output, ` +
    `and ${r.targetSolarInputW}W solar input. ` +
    `Its calculated Power Scenario Fit is ` +
    `${result.scenarioFit}/100.`
  );
}
