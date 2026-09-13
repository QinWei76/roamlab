/* =========================================================
   ROAMLAB UNIFIED GEAR SYSTEM MODEL — V1

   Purpose:
   Provide one shared data model for:
   - Owned gear
   - Gear to buy
   - Not-needed gear
   - Category requirements
   - Requirement gaps
   - Cross-category dependencies

   This file contains TYPES ONLY.
   No recommendation logic lives here yet.
   ========================================================= */

/* =========================================================
   1. ADVENTURE PROFILE
   ========================================================= */

export type VehicleKey =
  | "suv"
  | "truck"
  | "van"
  | "crossover"
  | "city";

export type TripKey =
  | "weekend"
  | "road-trip"
  | "basecamp"
  | "remote";

export type CrewKey =
  | "solo"
  | "couple"
  | "family"
  | "friends";

export type DurationKey =
  | "overnight"
  | "weekend"
  | "multi-day"
  | "extended";

export type AdventureProfile = {
  vehicle: VehicleKey;
  trip: TripKey;
  crew: CrewKey;
  people: number;
  duration: DurationKey;
};

/* =========================================================
   2. GEAR OWNERSHIP / INTENT STATE

   owned
   = user already owns it and plans to bring it

   to-buy
   = user wants RoamLab to help configure / recommend it

   not-needed
   = user does not need it for this trip
   ========================================================= */

export type GearOwnershipStatus =
  | "owned"
  | "to-buy"
  | "not-needed";

/* =========================================================
   3. GEAR PRIORITY
   ========================================================= */

export type GearPriority =
  | "essential"
  | "recommended"
  | "optional";

/* =========================================================
   4. GEAR CATEGORIES

   Keep this broad enough for future expansion.
   ========================================================= */

export type GearCategory =
  | "sleeping"
  | "clothing"
  | "lighting"
  | "hydration"
  | "hygiene"
  | "personal-essentials"
  | "power"
  | "cooking"
  | "food-storage"
  | "water-storage"
  | "storage"
  | "shelter"
  | "furniture"
  | "first-aid"
  | "fire-safety"
  | "tire-repair"
  | "vehicle-recovery"
  | "jump-start"
  | "navigation"
  | "communication"
  | "emergency-food-water"
  | "other";

/* =========================================================
   5. TECHNICAL SPEC VALUE

   This flexible structure allows different categories
   to store different technical fields without forcing
   every item into one universal schema.

   Examples:
   watts = 45
   hoursPerDay = 10
   capacityLiters = 40
   weightKg = 12.5
   temperatureRatingC = -5
   ========================================================= */

export type GearSpecValue =
  | string
  | number
  | boolean
  | null;

export type GearSpecs = Record<
  string,
  GearSpecValue
>;

/* =========================================================
   6. POWER LOAD

   Used by any equipment that consumes electricity.

   Example:
   12V fridge
   watts: 45
   hoursPerDay: 10

   dailyWh = 450 Wh/day
   ========================================================= */

export type PowerLoad = {
  watts: number;

  hoursPerDay: number;

  quantity?: number;

  dutyCycle?: number;

  surgeWatts?: number;

  notes?: string;
};

/* =========================================================
   7. WATER LOAD / CAPACITY

   Useful for:
   - water containers
   - hydration
   - showers
   - cooking water
   ========================================================= */

export type WaterLoad = {
  liters?: number;

  litersPerDay?: number;

  quantity?: number;

  notes?: string;
};

/* =========================================================
   8. STORAGE / SPACE LOAD

   Later this can feed the vehicle-space engine.
   ========================================================= */

export type SpaceLoad = {
  volumeLiters?: number;

  weightKg?: number;

  lengthCm?: number;

  widthCm?: number;

  heightCm?: number;

  roofMounted?: boolean;

  notes?: string;
};

/* =========================================================
   9. FUEL LOAD

   Useful for propane / gas / liquid fuel systems.
   ========================================================= */

export type FuelLoad = {
  fuelType:
    | "propane"
    | "butane"
    | "isobutane"
    | "gasoline"
    | "diesel"
    | "other";

  amount?: number;

  unit?:
    | "g"
    | "kg"
    | "oz"
    | "lb"
    | "liter";

  notes?: string;
};

/* =========================================================
   10. GEAR SYSTEM EFFECTS

   One piece of gear may influence other categories.

   Examples:

   fridge:
   - adds power load
   - satisfies food-storage requirement

   induction cooker:
   - satisfies cooking
   - adds large power load

   roof tent:
   - satisfies sleeping
   - consumes roof space
   - adds vehicle load
   ========================================================= */

export type GearSystemEffects = {
  powerLoad?: PowerLoad;

  waterLoad?: WaterLoad;

  spaceLoad?: SpaceLoad;

  fuelLoad?: FuelLoad;

  satisfiesCategories?: GearCategory[];

  affectsCategories?: GearCategory[];

  notes?: string[];
};

/* =========================================================
   11. TRIP GEAR ITEM

   This is the core object.

   Every item the user owns, wants to buy,
   or does not need can use this structure.
   ========================================================= */

export type TripGearItem = {
  id: string;

  name: string;

  category: GearCategory;

  status: GearOwnershipStatus;

  priority: GearPriority;

  quantity: number;

  /*
    User-owned items can optionally store a known brand/model.
  */

  brand?: string;

  model?: string;

  /*
    Purchase-related information.

    owned items normally have plannedBudget = 0
    unless the user wants replacement / upgrade planning.
  */

  plannedBudget?: number;

  purchasePrice?: number;

  /*
    Flexible technical specification fields.
  */

  specs?: GearSpecs;

  /*
    Cross-system effects.
  */

  effects?: GearSystemEffects;

  /*
    Whether this item was suggested by RoamLab
    or explicitly selected by the user.
  */

  source?:
    | "roamlab"
    | "user"
    | "imported";

  notes?: string[];
};

/* =========================================================
   12. TRIP GEAR STATE

   This represents the user's complete equipment state
   for one trip.

   IMPORTANT:
   Budget applies to TO-BUY gear,
   not to all gear carried on the trip.
   ========================================================= */

export type TripGearState = {
  profile: AdventureProfile;

  items: TripGearItem[];

  /*
    Maximum total amount the user is willing to spend.
    This is a ceiling, NOT a spending target.
  */

  totalBudget?: number;

  currency?: "USD";

  /*
    Later:
    destination
    season
    weather
    altitude
    road difficulty
    etc.
  */

  notes?: string[];
};

/* =========================================================
   13. REQUIREMENT LEVEL
   ========================================================= */

export type RequirementLevel =
  | "minimum"
  | "recommended"
  | "professional";

/* =========================================================
   14. CATEGORY REQUIREMENT

   Each category engine will generate these.

   Example:

   Power:
   metric = "capacityWh"
   required = 1200

   Water:
   metric = "capacityLiters"
   required = 35

   Sleeping:
   metric = "temperatureRatingC"
   required = -5
   ========================================================= */

export type CategoryRequirement = {
  id: string;

  category: GearCategory;

  metric: string;

  required: number | string | boolean;

  unit?: string;

  level: RequirementLevel;

  reason: string;

  hardRequirement?: boolean;
};

/* =========================================================
   15. REQUIREMENT COVERAGE

   Describes how much of a requirement is already covered
   by owned or selected equipment.
   ========================================================= */

export type RequirementCoverage = {
  requirementId: string;

  category: GearCategory;

  coveredByItemIds: string[];

  currentValue:
    | number
    | string
    | boolean
    | null;

  requiredValue:
    | number
    | string
    | boolean;

  satisfied: boolean;

  coveragePercent?: number;
};

/* =========================================================
   16. REQUIREMENT GAP

   This is what RoamLab still needs to solve.

   Example:

   Required water = 40L
   Owned water capacity = 20L
   Gap = 20L

   Required Power = 1400Wh
   Owned battery = 500Wh
   Gap = 900Wh
   ========================================================= */

export type RequirementGap = {
  requirementId: string;

  category: GearCategory;

  metric: string;

  requiredValue:
    | number
    | string
    | boolean;

  currentValue:
    | number
    | string
    | boolean
    | null;

  gapValue:
    | number
    | string
    | boolean
    | null;

  unit?: string;

  severity:
    | "none"
    | "low"
    | "medium"
    | "high"
    | "critical";

  needsPurchase: boolean;

  reason: string;
};

/* =========================================================
   17. DEPENDENCY EFFECT

   Represents a cross-category change.

   Example:
   induction cooker
   → Power
   → continuousOutputW + 1200
   ========================================================= */

export type DependencyEffect = {
  targetCategory: GearCategory;

  metric: string;

  operation:
    | "add"
    | "subtract"
    | "multiply"
    | "set"
    | "min"
    | "max";

  value: number | string | boolean;

  unit?: string;

  reason: string;
};

/* =========================================================
   18. DEPENDENCY RULE

   Example:

   IF:
   category = cooking
   item contains induction cooker
   status = owned OR to-buy

   THEN:
   add power requirements.
   ========================================================= */

export type GearDependencyRule = {
  id: string;

  name: string;

  sourceCategory: GearCategory;

  sourceItemId?: string;

  sourceItemName?: string;

  appliesWhenStatus?: GearOwnershipStatus[];

  effects: DependencyEffect[];
};

/* =========================================================
   19. CATEGORY ANALYSIS RESULT

   Every future category engine can return this same shape.

   Power, Water, Sleeping, Safety, etc.
   ========================================================= */

export type CategoryAnalysisResult = {
  category: GearCategory;

  requirements: CategoryRequirement[];

  coverage: RequirementCoverage[];

  gaps: RequirementGap[];

  satisfied: boolean;

  notes?: string[];
};

/* =========================================================
   20. SYSTEM BUDGET SUMMARY

   Budget is a ceiling.

   RoamLab should preserve unused budget when the
   requirements are already sufficiently satisfied.
   ========================================================= */

export type SystemBudgetSummary = {
  totalBudget: number;

  plannedSpend: number;

  remainingBudget: number;

  ownedGearValue?: number;

  currency: "USD";

  withinBudget: boolean;
};

/* =========================================================
   21. SYSTEM ANALYSIS RESULT

   This will eventually become the output of the
   complete RoamLab System Recommendation Engine.
   ========================================================= */

export type GearSystemAnalysis = {
  profile: AdventureProfile;

  gearState: TripGearState;

  categoryResults: CategoryAnalysisResult[];

  unresolvedGaps: RequirementGap[];

  budget?: SystemBudgetSummary;

  missionCapable: boolean;

  notes?: string[];
};
