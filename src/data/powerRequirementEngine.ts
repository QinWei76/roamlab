import type {
  DurationKey,
  TripGearItem,
  TripGearState,
  TripKey,
} from "@/types/gearSystem";

import {
  analyzeGearDependencies,
  isActiveGearItem,
} from "@/data/gearDependencyEngine";

/* =========================================================
   ROAMLAB POWER REQUIREMENT ENGINE — V1

   PURPOSE

   Convert the user's REAL trip system into
   actual power requirements.

   IMPORTANT:

   This engine does NOT select products.

   It answers:

   - How much energy is used per day?
   - How much stored battery energy is required?
   - How much AC output is required?
   - How much surge output is required?
   - How much solar input is useful?
   - How fast should AC charging be?

   FLOW

   Adventure Profile
        +
   Owned Gear
        +
   Gear To Configure
        ↓
   Dependency Analysis
        ↓
   Power Requirement
        ↓
   Gap Analysis
        ↓
   Product Recommendation

   ========================================================= */


/* =========================================================
   1. OUTPUT TYPES
   ========================================================= */

export type PowerHardRequirement = {
  metric:
    | "batteryCapacityWh"
    | "continuousAcOutputW"
    | "surgeOutputW"
    | "solarInputW"
    | "acRechargeW";

  minimum: number;

  unit: "Wh" | "W";

  reason: string;
};

export type PowerRequirement = {
  /*
    Actual electrical consumption from active gear.
  */

  dailyLoadWh: number;

  /*
    Estimated number of days the system should survive
    before a meaningful recharge opportunity.
  */

  autonomyDays: number;

  /*
    Energy needed during that autonomy window
    before losses and reserve.
  */

  autonomyEnergyWh: number;

  /*
    Conversion + inverter + wiring losses.
  */

  systemLossPercent: number;

  /*
    Emergency / uncertainty reserve.
  */

  safetyReservePercent: number;

  /*
    Final battery capacity target.
  */

  requiredBatteryCapacityWh: number;

  /*
    AC appliance requirements.

    DC loads like a 12V fridge should NOT force
    an 1800W inverter requirement.
  */

  requiredContinuousAcOutputW: number;

  requiredSurgeOutputW: number;

  /*
    Recommended charging capability.
  */

  recommendedSolarInputW: number;

  recommendedAcRechargeW: number;

  /*
    Whether solar is already part of the intended system.
  */

  solarPlanned: boolean;

  /*
    Human-readable explanation.
  */

  reasons: string[];

  hardRequirements: PowerHardRequirement[];
};


/* =========================================================
   2. ROUNDING HELPERS

   Product capacities commonly come in sensible ranges.
   We round upward because requirements are minimums.
   ========================================================= */

function roundUp(
  value: number,
  step: number
) {
  if (value <= 0) {
    return 0;
  }

  return (
    Math.ceil(value / step) *
    step
  );
}


/* =========================================================
   3. SOLAR DETECTION

   V1 uses active trip gear.

   Later this can use a formal capability field instead
   of product-name recognition.
   ========================================================= */

function hasPlannedSolar(
  items: TripGearItem[]
) {
  return items.some((item) => {
    if (!isActiveGearItem(item)) {
      return false;
    }

    const name =
      item.name.toLowerCase();

    return (
      item.category === "power" &&
      name.includes("solar")
    );
  });
}


/* =========================================================
   4. AC LOAD DETECTION

   IMPORTANT DESIGN DETAIL

   Not every electrical load is an AC inverter load.

   Example:

   12V fridge
   → consumes battery energy
   → does NOT necessarily require AC inverter output

   Induction cooker
   → consumes battery energy
   → DOES require high AC output

   Existing PowerLoad does not yet include an explicit
   AC/DC field, so V1 uses:

   1. specs.powerType / specs.inputType if supplied
   2. known appliance-name recognition as fallback

   Later we can formalize:
   powerType: "ac" | "dc" | "usb"
   ========================================================= */

function isAcPoweredItem(
  item: TripGearItem
) {
  const powerType =
    item.specs?.powerType;

  const inputType =
    item.specs?.inputType;

  if (
    powerType === "ac" ||
    inputType === "ac"
  ) {
    return true;
  }

  if (
    powerType === "dc" ||
    powerType === "usb" ||
    inputType === "dc" ||
    inputType === "usb"
  ) {
    return false;
  }

  const name =
    item.name.toLowerCase();

  const knownAcLoads = [
    "induction",
    "electric cooker",
    "electric kettle",
    "microwave",
    "coffee maker",
    "hair dryer",
    "portable air conditioner",
    "portable ac",
    "electric heater",
    "space heater",
    "toaster",
  ];

  return knownAcLoads.some(
    (keyword) =>
      name.includes(keyword)
  );
}


/* =========================================================
   5. CALCULATE REAL AC REQUIREMENT

   We calculate AC output directly from active gear
   instead of blindly using all electrical loads.
   ========================================================= */

function calculateAcRequirement(
  items: TripGearItem[]
) {
  let continuousW = 0;
  let surgeW = 0;

  for (const item of items) {
    if (!isActiveGearItem(item)) {
      continue;
    }

    const load =
      item.effects?.powerLoad;

    if (!load) {
      continue;
    }

    if (!isAcPoweredItem(item)) {
      continue;
    }

    const quantity =
      load.quantity ??
      item.quantity ??
      1;

    /*
      V1 assumes simultaneous maximum use.

      Later the dependency engine can model
      simultaneous / non-simultaneous loads.
    */

    const itemContinuous =
      load.watts * quantity;

    const itemSurge =
      (load.surgeWatts ??
        load.watts) *
      quantity;

    continuousW +=
      itemContinuous;

    surgeW += itemSurge;
  }

  return {
    continuousW,
    surgeW,
  };
}


/* =========================================================
   6. AUTONOMY WINDOW

   This is NOT total trip duration.

   It means:

   "How long should the battery operate before
   we reasonably expect meaningful recharging?"

   Example:

   8-day road trip with daily driving
   does NOT necessarily require 8 days of stored energy.

   A remote multi-day trip without charging
   may require several days of autonomy.

   Solar also reduces the required stored-energy window.
   ========================================================= */

function calculateAutonomyDays({
  trip,
  duration,
  solarPlanned,
}: {
  trip: TripKey;
  duration: DurationKey;
  solarPlanned: boolean;
}) {
  /*
    Road trips normally create frequent vehicle /
    campground recharge opportunities.
  */

  if (trip === "road-trip") {
    return 1;
  }

  /*
    Overnight trips only require one day.
  */

  if (duration === "overnight") {
    return 1;
  }

  /*
    Weekend
  */

  if (duration === "weekend") {
    if (solarPlanned) {
      return 1.5;
    }

    return 2;
  }

  /*
    Multi-day
  */

  if (duration === "multi-day") {
    if (trip === "remote") {
      return solarPlanned
        ? 2
        : 3;
    }

    return solarPlanned
      ? 1.5
      : 2;
  }

  /*
    Extended
  */

  if (duration === "extended") {
    if (trip === "remote") {
      return solarPlanned
        ? 2
        : 4;
    }

    return solarPlanned
      ? 1.5
      : 3;
  }

  return 1;
}


/* =========================================================
   7. SAFETY RESERVE

   Remote trips receive more reserve because:

   - weather may reduce solar
   - devices may run longer than expected
   - charging opportunities may fail
   - emergency communications must remain available
   ========================================================= */

function getSafetyReservePercent(
  trip: TripKey
) {
  switch (trip) {
    case "remote":
      return 25;

    case "basecamp":
      return 15;

    case "road-trip":
      return 10;

    case "weekend":
    default:
      return 10;
  }
}


/* =========================================================
   8. SYSTEM LOSS

   Battery nameplate capacity is not equal to
   perfectly usable delivered energy.

   V1 assumes a 10% total system loss.

   Later this can become category-aware:

   - DC load efficiency
   - inverter efficiency
   - temperature
   - battery chemistry
   ========================================================= */

const DEFAULT_SYSTEM_LOSS_PERCENT =
  10;


/* =========================================================
   9. SOLAR REQUIREMENT

   Solar is sized from actual daily demand.

   V1 assumption:

   effective solar production
   ≈ panel watts × 4 peak-sun-hours × 75%

   Therefore:

   panelWatts
   ≈ dailyWh / 3

   Remote trips receive additional margin.
   ========================================================= */

function calculateSolarRequirement({
  dailyLoadWh,
  trip,
  solarPlanned,
}: {
  dailyLoadWh: number;
  trip: TripKey;
  solarPlanned: boolean;
}) {
  if (!solarPlanned) {
    return 0;
  }

  if (dailyLoadWh <= 0) {
    return 0;
  }

  const peakSunHours = 4;

  const solarEfficiency =
    0.75;

  const baseSolarW =
    dailyLoadWh /
    (
      peakSunHours *
      solarEfficiency
    );

  const remoteMultiplier =
    trip === "remote"
      ? 1.25
      : 1;

  const target =
    baseSolarW *
    remoteMultiplier;

  /*
    Keep a practical minimum if the user
    intentionally includes solar.
  */

  return Math.max(
    100,
    roundUp(
      target,
      50
    )
  );
}


/* =========================================================
   10. AC RECHARGE REQUIREMENT

   Determines how fast the battery should reasonably
   recharge from wall / campground / vehicle AC.

   We do NOT require ultra-fast charging automatically.

   Larger systems get proportionally higher targets.
   ========================================================= */

function calculateAcRechargeRequirement(
  batteryCapacityWh: number,
  trip: TripKey
) {
  if (
    batteryCapacityWh <= 0
  ) {
    return 0;
  }

  /*
    Desired recharge window.

    Road trip:
    faster turnaround is useful.

    Remote:
    when AC becomes available,
    recovering quickly is valuable.

    Basecamp/weekend:
    slower is acceptable.
  */

  let rechargeHours = 3;

  if (
    trip === "road-trip" ||
    trip === "remote"
  ) {
    rechargeHours = 2;
  }

  const requiredW =
    batteryCapacityWh /
    rechargeHours;

  return Math.max(
    300,
    roundUp(
      requiredW,
      100
    )
  );
}


/* =========================================================
   11. MAIN POWER REQUIREMENT ENGINE
   ========================================================= */

export function calculatePowerRequirement(
  gearState: TripGearState
): PowerRequirement {
  const dependency =
    analyzeGearDependencies(
      gearState
    );

  const activeItems =
    dependency.activeItems;

  const dailyLoadWh =
    dependency.power
      .estimatedDailyWh;

  const solarPlanned =
    hasPlannedSolar(
      activeItems
    );

  const autonomyDays =
    calculateAutonomyDays({
      trip:
        gearState.profile.trip,

      duration:
        gearState.profile.duration,

      solarPlanned,
    });

  const autonomyEnergyWh =
    dailyLoadWh *
    autonomyDays;

  const safetyReservePercent =
    getSafetyReservePercent(
      gearState.profile.trip
    );

  const usableEfficiency =
    1 -
    DEFAULT_SYSTEM_LOSS_PERCENT /
      100;

  /*
    Battery capacity calculation:

    actual energy needed
    ÷ system efficiency
    × safety reserve

    Example:

    1000 Wh demand
    ÷ 0.90
    × 1.25
    = 1389 Wh battery target
  */

  const rawBatteryCapacity =
    autonomyEnergyWh > 0
      ? (
          autonomyEnergyWh /
          usableEfficiency
        ) *
        (
          1 +
          safetyReservePercent /
            100
        )
      : 0;

  const requiredBatteryCapacityWh =
    roundUp(
      rawBatteryCapacity,
      50
    );

  const acLoad =
    calculateAcRequirement(
      activeItems
    );

  /*
    AC output headroom.

    We do not want an inverter running at
    exactly 100% of its required continuous load.
  */

  const acHeadroomMultiplier =
    1.2;

  const requiredContinuousAcOutputW =
    acLoad.continuousW > 0
      ? roundUp(
          acLoad.continuousW *
            acHeadroomMultiplier,
          100
        )
      : 0;

  const requiredSurgeOutputW =
    acLoad.surgeW > 0
      ? roundUp(
          Math.max(
            acLoad.surgeW,
            requiredContinuousAcOutputW
          ),
          100
        )
      : 0;

  const recommendedSolarInputW =
    calculateSolarRequirement({
      dailyLoadWh,

      trip:
        gearState.profile.trip,

      solarPlanned,
    });

  const recommendedAcRechargeW =
    calculateAcRechargeRequirement(
      requiredBatteryCapacityWh,
      gearState.profile.trip
    );

  const reasons: string[] = [];

  reasons.push(
    `Active gear uses approximately ${dailyLoadWh} Wh per day.`
  );

  reasons.push(
    `The system is designed for approximately ${autonomyDays} day(s) between meaningful recharge opportunities.`
  );

  reasons.push(
    `${DEFAULT_SYSTEM_LOSS_PERCENT}% system loss is included.`
  );

  reasons.push(
    `${safetyReservePercent}% safety reserve is included for the selected trip profile.`
  );

  if (
    requiredContinuousAcOutputW >
    0
  ) {
    reasons.push(
      `Active AC appliances require approximately ${requiredContinuousAcOutputW} W of continuous inverter output including operating headroom.`
    );
  } else {
    reasons.push(
      "No significant AC appliance load was detected in the current gear system."
    );
  }

  if (solarPlanned) {
    reasons.push(
      `Solar is part of the planned system; approximately ${recommendedSolarInputW} W of solar input is recommended from current daily demand.`
    );
  } else {
    reasons.push(
      "Solar is not currently part of the active gear system."
    );
  }

  const hardRequirements: PowerHardRequirement[] =
    [];

  if (
    requiredBatteryCapacityWh >
    0
  ) {
    hardRequirements.push({
      metric:
        "batteryCapacityWh",

      minimum:
        requiredBatteryCapacityWh,

      unit: "Wh",

      reason:
        "Minimum stored energy required for the calculated autonomy window, losses, and safety reserve.",
    });
  }

  if (
    requiredContinuousAcOutputW >
    0
  ) {
    hardRequirements.push({
      metric:
        "continuousAcOutputW",

      minimum:
        requiredContinuousAcOutputW,

      unit: "W",

      reason:
        "Minimum continuous AC inverter output required by active AC appliances with operating headroom.",
    });
  }

  if (
    requiredSurgeOutputW > 0
  ) {
    hardRequirements.push({
      metric:
        "surgeOutputW",

      minimum:
        requiredSurgeOutputW,

      unit: "W",

      reason:
        "Minimum surge output required by active AC equipment.",
    });
  }

  if (
    recommendedSolarInputW >
    0
  ) {
    hardRequirements.push({
      metric:
        "solarInputW",

      minimum:
        recommendedSolarInputW,

      unit: "W",

      reason:
        "Recommended solar recharge capability based on daily electrical demand and expected solar production.",
    });
  }

  if (
    recommendedAcRechargeW >
    0
  ) {
    hardRequirements.push({
      metric:
        "acRechargeW",

      minimum:
        recommendedAcRechargeW,

      unit: "W",

      reason:
        "Recommended AC charging rate for practical system recovery.",
    });
  }

  return {
    dailyLoadWh,

    autonomyDays,

    autonomyEnergyWh:
      Math.round(
        autonomyEnergyWh
      ),

    systemLossPercent:
      DEFAULT_SYSTEM_LOSS_PERCENT,

    safetyReservePercent,

    requiredBatteryCapacityWh,

    requiredContinuousAcOutputW,

    requiredSurgeOutputW,

    recommendedSolarInputW,

    recommendedAcRechargeW,

    solarPlanned,

    reasons,

    hardRequirements,
  };
}


/* =========================================================
   12. SIMPLE MISSION-CAPABLE CHECK

   This is NOT full product scoring.

   It only checks whether a candidate's technical
   capabilities meet the hard Power requirements.

   This distinction is very important:

   FIRST:
   Is the product sufficient?

   THEN:
   Among sufficient products, compare:
   - reliability
   - safety
   - evidence
   - cost
   - weight
   - field practicality
   ========================================================= */

export type PowerCapability = {
  batteryCapacityWh: number;

  continuousAcOutputW: number;

  surgeOutputW?: number;

  maxSolarInputW?: number;

  maxAcRechargeW?: number;
};

export type PowerCapabilityCheck = {
  missionCapable: boolean;

  checks: {
    batteryCapacity: boolean;

    continuousAcOutput: boolean;

    surgeOutput: boolean;

    solarInput: boolean;

    acRecharge: boolean;
  };

  failures: string[];
};

export function checkPowerCapability(
  requirement: PowerRequirement,
  capability: PowerCapability
): PowerCapabilityCheck {
  const batteryCapacity =
    capability.batteryCapacityWh >=
    requirement.requiredBatteryCapacityWh;

  const continuousAcOutput =
    capability.continuousAcOutputW >=
    requirement.requiredContinuousAcOutputW;

  const surgeOutput =
    requirement.requiredSurgeOutputW ===
      0 ||
    (
      capability.surgeOutputW ??
      capability.continuousAcOutputW
    ) >=
      requirement.requiredSurgeOutputW;

  const solarInput =
    requirement.recommendedSolarInputW ===
      0 ||
    (
      capability.maxSolarInputW ??
      0
    ) >=
      requirement.recommendedSolarInputW;

  const acRecharge =
    requirement.recommendedAcRechargeW ===
      0 ||
    (
      capability.maxAcRechargeW ??
      0
    ) >=
      requirement.recommendedAcRechargeW;

  const failures: string[] = [];

  if (!batteryCapacity) {
    failures.push(
      `Battery capacity is below ${requirement.requiredBatteryCapacityWh} Wh.`
    );
  }

  if (!continuousAcOutput) {
    failures.push(
      `Continuous AC output is below ${requirement.requiredContinuousAcOutputW} W.`
    );
  }

  if (!surgeOutput) {
    failures.push(
      `Surge output is below ${requirement.requiredSurgeOutputW} W.`
    );
  }

  if (!solarInput) {
    failures.push(
      `Solar input capability is below ${requirement.recommendedSolarInputW} W.`
    );
  }

  if (!acRecharge) {
    failures.push(
      `AC recharge capability is below ${requirement.recommendedAcRechargeW} W.`
    );
  }

  return {
    missionCapable:
      batteryCapacity &&
      continuousAcOutput &&
      surgeOutput &&
      solarInput &&
      acRecharge,

    checks: {
      batteryCapacity,
      continuousAcOutput,
      surgeOutput,
      solarInput,
      acRecharge,
    },

    failures,
  };
}
