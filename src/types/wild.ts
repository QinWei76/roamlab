/* =========================================================
   ROAMLAB — WILD CORE MODEL
   =========================================================

   A Wild is the central journey object in RoamLab.

   BEFORE:
   Explore / Ways In / Prepare / Safety / Learn
                  ↓
           YOUR WILD PLAN

   DURING:
                GO WILD

   AFTER:
        Journal → Wild Wall → Badges

   IMPORTANT:
   - Ways In does NOT own Gear Room.
   - Gear Room belongs to Prepare.
   - Gear Room can be entered from:
       1. Ways In
       2. Prepare / Backpack
       3. Your Wild Plan
   - Your Wild Plan is the pre-trip mission control.
   ========================================================= */


/* =========================================================
   CORE
   ========================================================= */

export type WildId = string;

export type WildStatus =
  | "idea"
  | "planning"
  | "ready"
  | "active"
  | "completed"
  | "published"
  | "archived";

export type WildVisibility =
  | "private"
  | "unlisted"
  | "public";


/* =========================================================
   ACTIVITIES
   ========================================================= */

export type WildActivity =
  | "drive"
  | "camp"
  | "hike"
  | "backpack"
  | "bike"
  | "bikepack"
  | "kayak"
  | "canoe"
  | "paddle"
  | "climb"
  | "fish"
  | "trail-run"
  | "ski"
  | "snowboard"
  | "snowshoe"
  | "overland"
  | "beach"
  | "photography"
  | "wildlife"
  | "family-outdoors"
  | "dog-outdoors"
  | "other";


/* =========================================================
   WAYS IN
   ========================================================= */

export type WildWayIn =
  | "drive"
  | "walk"
  | "bike"
  | "kayak"
  | "mixed"
  | "other";

export type WildTripStyle =
  | "weekend"
  | "road-trip"
  | "basecamp"
  | "remote"
  | "custom";


/* =========================================================
   VEHICLE
   ========================================================= */

export type WildVehicleType =
  | "suv"
  | "truck"
  | "van"
  | "crossover"
  | "city"
  | "4x4"
  | "rv"
  | "motorcycle"
  | "other";

export interface WildVehicle {
  type: WildVehicleType;

  make?: string;
  model?: string;
  year?: number;

  drivetrain?:
    | "2wd"
    | "awd"
    | "4wd"
    | "unknown";

  fuelType?:
    | "gasoline"
    | "diesel"
    | "hybrid"
    | "electric"
    | "other";

  fuelEfficiencyLPer100Km?: number;

  energyEfficiencyKWhPer100Km?: number;

  notes?: string;
}


/* =========================================================
   DESTINATION
   ========================================================= */

export interface WildCoordinates {
  latitude: number;
  longitude: number;
}

export interface WildDestination {
  name: string;

  region?: string;
  country?: string;

  coordinates?: WildCoordinates;

  environment?: string[];

  notes?: string;
}


/* =========================================================
   SCHEDULE
   ========================================================= */

export type WildDurationType =
  | "day-trip"
  | "overnight"
  | "weekend"
  | "multi-day"
  | "extended"
  | "custom";

export type WildTimingMode =
  | "exact"
  | "flexible"
  | "undecided";

export interface WildSchedule {
  startDate?: string;
  endDate?: string;

  timingMode?: WildTimingMode;

  durationType?: WildDurationType;

  days?: number;
  nights?: number;

  flexibleDates?: boolean;
}


/* =========================================================
   WILD INTENT / DESTINATION DISCOVERY

   Wild Intent captures what the user wants from a Wild
   BEFORE a destination is necessarily known.

   It is discovery context, not a second copy of the full plan.
   Canonical Crew, Schedule and Budget data remain in their
   existing plan systems.
   ========================================================= */

export type WildDestinationMode =
  | "known"
  | "discover"
  | "undecided";

export type WildDifficulty =
  | "easy"
  | "moderate"
  | "challenging"
  | "not-sure";

export type WildEnvironment =
  | "mountain"
  | "forest"
  | "coast"
  | "desert"
  | "lake"
  | "river"
  | "grassland"
  | "snow"
  | "mixed"
  | "not-sure";

export type WildVibe =
  | "quiet"
  | "scenic"
  | "remote"
  | "social"
  | "adventure"
  | "relaxed"
  | "not-sure";

export interface WildIntentOrigin {
  name: string;
  region?: string;
  country?: string;
  coordinates?: WildCoordinates;
}

export interface WildIntent {
  destinationMode?: WildDestinationMode;
  activities?: WildActivity[];
  difficulty?: WildDifficulty;
  environments?: WildEnvironment[];
  vibes?: WildVibe[];
  startingFrom?: WildIntentOrigin;
  maxTravelDistanceKm?: number;
  prompt?: string;
  notes?: string;
}


/* =========================================================
   CREW
   ========================================================= */

export type WildCrewType =
  | "solo"
  | "couple"
  | "family"
  | "friends"
  | "group";

export interface WildCrewMember {
  id: string;

  name?: string;
  role?: string;

  ageGroup?:
    | "child"
    | "teen"
    | "adult"
    | "senior";

  notes?: string;
}

export interface WildCrew {
  type: WildCrewType;

  people: number;

  members?: WildCrewMember[];

  pets?: number;
}


/* =========================================================
   ROUTE
   ========================================================= */

export type WildRoutePointType =
  | "start"
  | "stop"
  | "camp"
  | "water"
  | "fuel"
  | "charging"
  | "viewpoint"
  | "emergency"
  | "finish"
  | "other";

export interface WildRoutePoint {
  id: string;

  name: string;

  type?: WildRoutePointType;

  coordinates?: WildCoordinates;

  arrivalTime?: string;
  departureTime?: string;

  notes?: string;
}

export interface WildRoute {
  name?: string;

  distanceKm?: number;

  elevationGainM?: number;

  estimatedHours?: number;

  points?: WildRoutePoint[];

  notes?: string;
}


/* =========================================================
   CONDITIONS
   ========================================================= */

export type WildConditionRisk =
  | "low"
  | "medium"
  | "high"
  | "unknown";

export interface WildConditions {
  season?: string;

  expectedMinTempC?: number;
  expectedMaxTempC?: number;

  rainRisk?: WildConditionRisk;
  windRisk?: WildConditionRisk;
  snowRisk?: WildConditionRisk;

  altitudeM?: number;

  terrain?: string[];

  waterAccess?: boolean;

  cellCoverage?:
    | "good"
    | "limited"
    | "none"
    | "unknown";

  weatherSummary?: string;

  notes?: string;
}


/* =========================================================
   ADVENTURE
   ========================================================= */

export interface WildAdventure {
  /*
   * A Wild can begin as an intent before a destination is known.
   * Destination Discovery can later write the selected destination
   * back into this same Adventure.
   */
  intent?: WildIntent;

  destination?: WildDestination;

  schedule?: WildSchedule;

  activities: WildActivity[];

  wayIn?: WildWayIn;

  tripStyle?: WildTripStyle;

  vehicle?: WildVehicle;

  crew?: WildCrew;

  objectives?: string[];

  notes?: string;
}


/* =========================================================
   GEAR / PREPARE
   ========================================================= */

export type WildGearOwnershipStatus =
  | "owned"
  | "to-buy"
  | "borrow"
  | "rent"
  | "not-needed";

export type WildGearPriority =
  | "essential"
  | "recommended"
  | "optional";

export interface WildGearItem {
  id: string;

  name: string;

  category: string;

  ownershipStatus: WildGearOwnershipStatus;

  priority?: WildGearPriority;

  quantity?: number;

  productId?: string;

  estimatedCost?: number;

  actualCost?: number;

  notes?: string;
}

export interface WildGearSystem {
  items: WildGearItem[];

  estimatedGearCost?: number;

  actualGearCost?: number;

  generatedAt?: string;

  lastUpdatedAt?: string;
}


/* =========================================================
   CHECKLIST
   ========================================================= */

export type WildChecklistStatus =
  | "not-started"
  | "in-progress"
  | "complete";

export interface WildChecklistItem {
  id: string;

  label: string;

  category?: string;

  completed: boolean;

  essential?: boolean;

  notes?: string;
}

export interface WildPrepare {
  gear?: WildGearSystem;

  checklist?: WildChecklistItem[];

  checklistStatus?: WildChecklistStatus;

  notes?: string;
}


/* =========================================================
   SAFETY
   ========================================================= */

export type WildRiskLevel =
  | "low"
  | "moderate"
  | "high"
  | "critical";

export interface WildRisk {
  id: string;

  name: string;

  level: WildRiskLevel;

  description?: string;

  mitigation?: string[];

  resolved?: boolean;
}

export interface WildEmergencyContact {
  id: string;

  name: string;

  phone?: string;

  relationship?: string;
}

export interface WildEmergencyPlan {
  contacts?: WildEmergencyContact[];

  emergencyServices?: string;

  nearestMedicalFacility?: string;

  evacuationNotes?: string;

  checkInPlan?: string;

  communicationPlan?: string;

  notes?: string;
}

export interface WildSafety {
  overallRisk?: WildRiskLevel;

  risks?: WildRisk[];

  emergencyPlan?: WildEmergencyPlan;

  firstAidReady?: boolean;

  navigationReady?: boolean;

  communicationReady?: boolean;

  reviewed?: boolean;
}


/* =========================================================
   KNOWLEDGE / LEARN
   ========================================================= */

export type WildKnowledgeType =
  | "guide"
  | "skill"
  | "safety"
  | "first-aid"
  | "navigation"
  | "weather"
  | "gear"
  | "environment"
  | "local-rule";

export interface WildKnowledgeItem {
  id: string;

  title: string;

  type: WildKnowledgeType;

  url?: string;

  completed?: boolean;

  recommendedReason?: string;
}

export interface WildKnowledge {
  recommended?: WildKnowledgeItem[];

  completed?: string[];

  notes?: string;
}


/* =========================================================
   COST SYSTEM
   ========================================================= */

export type WildBudgetMode =
  | "total-wild-budget"
  | "gear-budget-only"
  | "no-budget";

export type WildCostCategory =
  | "transportation"
  | "gear"
  | "accommodation"
  | "campsite"
  | "food-water"
  | "permits-fees"
  | "activities"
  | "emergency-reserve"
  | "other";

export interface WildCostItem {
  id: string;

  name: string;

  category: WildCostCategory;

  estimatedCost?: number;

  actualCost?: number;

  notes?: string;
}

export interface WildTransportationCost {
  estimatedFuelCost?: number;

  estimatedChargingCost?: number;

  estimatedPublicTransportCost?: number;

  estimatedFlightCost?: number;

  estimatedRentalCost?: number;

  estimatedTolls?: number;

  estimatedParking?: number;

  estimatedShuttleCost?: number;

  estimatedOtherTransportCost?: number;

  estimatedTotal?: number;

  actualTotal?: number;
}

export interface WildBudgetAllocation {
  transportation?: number;

  gear?: number;

  accommodation?: number;

  campsite?: number;

  foodWater?: number;

  permitsFees?: number;

  activities?: number;

  emergencyReserve?: number;

  other?: number;
}

export interface WildCostSystem {
  currency: string;

  budgetMode: WildBudgetMode;

  /*
   * User's total budget for the entire Wild.
   * This must NEVER be treated automatically as Gear Budget.
   */
  totalWildBudget?: number;

  /*
   * Gear Budget is a child budget.
   * It may be entered directly by the user or allocated by RoamLab.
   */
  gearBudget?: number;

  allocation?: WildBudgetAllocation;

  transportation?: WildTransportationCost;

  items?: WildCostItem[];

  estimatedTotal?: number;

  actualTotal?: number;

  remainingBudget?: number;

  unallocatedBudget?: number;

  overBudgetBy?: number;

  notes?: string;
}


/* =========================================================
   READINESS
   ========================================================= */

export type WildReadinessStatus =
  | "not-started"
  | "needs-work"
  | "ready";

export interface WildReadinessArea {
  percent: number;

  status: WildReadinessStatus;

  missing?: string[];

  warnings?: string[];
}

export interface WildReadiness {
  overallPercent: number;

  gear?: WildReadinessArea;

  route?: WildReadinessArea;

  safety?: WildReadinessArea;

  knowledge?: WildReadinessArea;

  logistics?: WildReadinessArea;

  budget?: WildReadinessArea;

  lastCalculatedAt?: string;
}


/* =========================================================
   YOUR WILD PLAN
   ========================================================= */

export interface WildPlan {
  adventure: WildAdventure;

  route?: WildRoute;

  conditions?: WildConditions;

  prepare?: WildPrepare;

  safety?: WildSafety;

  knowledge?: WildKnowledge;

  cost?: WildCostSystem;

  readiness?: WildReadiness;

  notes?: string;
}


/* =========================================================
   JOURNAL — AFTER THE WILD
   ========================================================= */

export interface WildJournalPhoto {
  id: string;

  url: string;

  caption?: string;

  takenAt?: string;
}

export interface WildJournalEntry {
  id: string;

  createdAt: string;

  title?: string;

  text?: string;

  location?: WildDestination;

  photos?: WildJournalPhoto[];

  tags?: string[];
}

export interface WildJournal {
  entries: WildJournalEntry[];

  summary?: string;

  favoriteMoment?: string;

  lessonsLearned?: string[];

  gearNotes?: string[];

  actualRouteNotes?: string;

  wouldDoAgain?: boolean;
}


/* =========================================================
   WILD WALL
   ========================================================= */

export interface WildStory {
  id: string;

  title: string;

  excerpt?: string;

  coverImage?: string;

  publishedAt?: string;

  visibility: WildVisibility;

  tags?: string[];

  likes?: number;

  comments?: number;
}


/* =========================================================
   BADGES / ACHIEVEMENTS
   ========================================================= */

export interface WildBadge {
  id: string;

  name: string;

  description?: string;

  icon?: string;

  earnedAt?: string;
}

export interface WildAchievements {
  badges: WildBadge[];

  totalWilds?: number;

  totalNights?: number;

  totalDistanceKm?: number;
}


/* =========================================================
   AI CONTEXT
   ========================================================= */

export interface WildAIContext {
  summary?: string;

  userIntent?: string;

  constraints?: string[];

  preferences?: string[];

  recommendations?: string[];

  warnings?: string[];

  lastAnalyzedAt?: string;
}


/* =========================================================
   MAIN WILD OBJECT
   ========================================================= */

export interface Wild {
  id: WildId;

  title: string;

  status: WildStatus;

  visibility: WildVisibility;

  createdAt: string;

  updatedAt: string;

  coverImage?: string;

  /*
   * YOUR WILD PLAN
   * Everything required before departure.
   */
  plan: WildPlan;

  /*
   * AFTER THE WILD
   */
  journal?: WildJournal;

  /*
   * Public story selected from the Wild / Journal.
   */
  story?: WildStory;

  achievements?: WildAchievements;

  /*
   * Shared AI context across planning systems.
   */
  ai?: WildAIContext;
}


/* =========================================================
   DASHBOARD SUMMARY
   ========================================================= */

export interface WildSummary {
  id: WildId;

  title: string;

  status: WildStatus;

  coverImage?: string;

  destination?: string;

  startDate?: string;

  endDate?: string;

  activities?: WildActivity[];

  wayIn?: WildWayIn;

  people?: number;

  totalWildBudget?: number;

  estimatedTotalCost?: number;

  readinessPercent?: number;
}


/* =========================================================
   CREATE WILD
   ========================================================= */

export interface CreateWildInput {
  title?: string;

  visibility?: WildVisibility;

  intent?: WildIntent;

  destination?: WildDestination;

  schedule?: WildSchedule;

  activities?: WildActivity[];

  wayIn?: WildWayIn;

  tripStyle?: WildTripStyle;

  vehicle?: WildVehicle;

  crew?: WildCrew;

  /*
   * Prefer asking for Total Wild Budget.
   * Gear Budget is optional and separate.
   */
  totalWildBudget?: number;

  gearBudget?: number;

  currency?: string;
}
