/* =========================================================
   ROAMLAB PRODUCT RECOMMENDATION ENGINE
   ---------------------------------------------------------
   Purpose:
   1. Receive the user's Adventure Profile
   2. Receive the final selected gear categories
   3. Support two recommendation modes:
      - USER BUDGET SETUP
      - ROAMLAB PROFESSIONAL SETUP
   4. Provide a stable scoring/output structure
   5. Keep real product data separate for now
   ========================================================= */

/* =========================================================
   BASIC TYPES
   ========================================================= */

export type RecommendationMode =
  | "budget"
  | "professional";

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

export type GearPriority =
  | "essential"
  | "recommended"
  | "optional";

/* =========================================================
   ADVENTURE PROFILE
   ========================================================= */

export type AdventureProfile = {
  vehicle: VehicleKey;
  trip: TripKey;
  crew: CrewKey;
  people: number;
  duration: DurationKey;
};

/* =========================================================
   SELECTED GEAR CATEGORY

   This should match the categories coming from the current
   Gear Room / Gear System.

   We intentionally use string here so new categories can be
   added later without breaking the engine.
   ========================================================= */

export type SelectedGearCategory = {
  name: string;
  priority: GearPriority;
};

/* =========================================================
   PRODUCT DATA MODEL

   This is the structure we will later use for real products.
   For now, actual products do not need to be added yet.
   ========================================================= */

export type ProductCandidate = {
  id: string;

  name: string;

  brand: string;

  category: string;

  price: number;

  currency: "USD";

  productUrl?: string;

  affiliateUrl?: string;

  image?: string;

  /* -----------------------------------------
     GENERAL PRODUCT ATTRIBUTES
     0–100 unless otherwise noted
     ----------------------------------------- */

  reliabilityScore: number;

  durabilityScore: number;

  safetyScore: number;

  valueScore: number;

  portabilityScore?: number;

  capacityScore?: number;

  easeOfUseScore?: number;

  weatherResistanceScore?: number;

  repairabilityScore?: number;

  /* -----------------------------------------
     OPTIONAL PRODUCT CAPABILITIES
     ----------------------------------------- */

  maxPeople?: number;

  suitableVehicles?: VehicleKey[];

  suitableTrips?: TripKey[];

  suitableDurations?: DurationKey[];

  suitableCrews?: CrewKey[];

  /* -----------------------------------------
     EVIDENCE / PROFESSIONAL AUTHORITY
     ----------------------------------------- */

  evidence?: ProductEvidence[];
};

/* =========================================================
   EVIDENCE MODEL
   ========================================================= */

export type EvidenceType =
  | "manufacturer"
  | "manual"
  | "certification"
  | "independent-test"
  | "field-test"
  | "recall"
  | "reliability-data"
  | "editorial-review";

export type ProductEvidence = {
  type: EvidenceType;

  title: string;

  source?: string;

  url?: string;

  note?: string;

  /**
   * Confidence in this evidence source.
   * 0–100
   */
  confidence: number;
};

/* =========================================================
   SCORING BREAKDOWN
   ========================================================= */

export type ScoreBreakdown = {
  scenarioFit: number;

  reliability: number;

  safety: number;

  durability: number;

  value: number;

  evidenceConfidence: number;

  total: number;
};

/* =========================================================
   RECOMMENDATION RESULT
   ========================================================= */

export type ProductRecommendation = {
  category: string;

  product: ProductCandidate;

  score: ScoreBreakdown;

  reason: string;

  confidence: number;

  evidence: ProductEvidence[];
};

/* =========================================================
   CATEGORY RESULT
   ========================================================= */

export type CategoryRecommendation = {
  category: string;

  priority: GearPriority;

  recommendations: ProductRecommendation[];

  categoryBudget?: number;
};

/* =========================================================
   FULL SYSTEM OUTPUT
   ========================================================= */

export type RecommendationSystemResult = {
  mode: RecommendationMode;

  profile: AdventureProfile;

  totalBudget?: number;

  estimatedProfessionalBudget?: number;

  categories: CategoryRecommendation[];

  estimatedTotal: number;
};

/* =========================================================
   PROFESSIONAL WEIGHTS

   These are general v1 weights.

   Later we should create category-specific models:
   Power ≠ Sleeping ≠ Recovery ≠ First Aid.
   ========================================================= */

const PROFESSIONAL_WEIGHTS = {
  scenarioFit: 0.3,
  reliability: 0.3,
  safety: 0.2,
  durability: 0.15,
  value: 0.05,
};

/* =========================================================
   BUDGET WEIGHTS

   Budget mode puts more emphasis on price efficiency.
   ========================================================= */

const BUDGET_WEIGHTS = {
  scenarioFit: 0.4,
  reliability: 0.2,
  safety: 0.1,
  durability: 0.1,
  value: 0.2,
};

/* =========================================================
   HELPERS
   ========================================================= */

function clampScore(value: number): number {
  return Math.max(
    0,
    Math.min(100, value)
  );
}

function average(
  numbers: number[]
): number {
  if (numbers.length === 0) {
    return 0;
  }

  return (
    numbers.reduce(
      (sum, value) => sum + value,
      0
    ) / numbers.length
  );
}

/* =========================================================
   EVIDENCE CONFIDENCE
   ========================================================= */

export function calculateEvidenceConfidence(
  product: ProductCandidate
): number {
  if (
    !product.evidence ||
    product.evidence.length === 0
  ) {
    return 40;
  }

  return clampScore(
    average(
      product.evidence.map(
        (item) => item.confidence
      )
    )
  );
}

/* =========================================================
   SCENARIO FIT

   This is intentionally generic for v1.

   Later we will replace this with professional models per
   gear category.
   ========================================================= */

export function calculateScenarioFit(
  product: ProductCandidate,
  profile: AdventureProfile
): number {
  let score = 50;

  /* VEHICLE MATCH */

  if (
    product.suitableVehicles &&
    product.suitableVehicles.length > 0
  ) {
    if (
      product.suitableVehicles.includes(
        profile.vehicle
      )
    ) {
      score += 15;
    } else {
      score -= 15;
    }
  }

  /* TRIP MATCH */

  if (
    product.suitableTrips &&
    product.suitableTrips.length > 0
  ) {
    if (
      product.suitableTrips.includes(
        profile.trip
      )
    ) {
      score += 15;
    } else {
      score -= 10;
    }
  }

  /* DURATION MATCH */

  if (
    product.suitableDurations &&
    product.suitableDurations.length > 0
  ) {
    if (
      product.suitableDurations.includes(
        profile.duration
      )
    ) {
      score += 10;
    } else {
      score -= 5;
    }
  }

  /* CREW MATCH */

  if (
    product.suitableCrews &&
    product.suitableCrews.length > 0
  ) {
    if (
      product.suitableCrews.includes(
        profile.crew
      )
    ) {
      score += 10;
    } else {
      score -= 5;
    }
  }

  /* PEOPLE CAPACITY */

  if (
    typeof product.maxPeople === "number"
  ) {
    if (
      product.maxPeople >= profile.people
    ) {
      score += 10;
    } else {
      score -= 25;
    }
  }

  /* REMOTE TRIP BONUS / PENALTY */

  if (profile.trip === "remote") {
    if (
      product.reliabilityScore >= 80
    ) {
      score += 5;
    }

    if (
      product.safetyScore < 60
    ) {
      score -= 10;
    }
  }

  return clampScore(score);
}

/* =========================================================
   PROFESSIONAL SCORE

   Professional mode prioritizes:
   - scenario fit
   - reliability
   - safety
   - durability

   Price/value matters, but much less.
   ========================================================= */

export function calculateProfessionalScore(
  product: ProductCandidate,
  profile: AdventureProfile
): ScoreBreakdown {
  const scenarioFit =
    calculateScenarioFit(
      product,
      profile
    );

  const reliability =
    clampScore(
      product.reliabilityScore
    );

  const safety =
    clampScore(
      product.safetyScore
    );

  const durability =
    clampScore(
      product.durabilityScore
    );

  const value =
    clampScore(
      product.valueScore
    );

  const evidenceConfidence =
    calculateEvidenceConfidence(
      product
    );

  let total =
    scenarioFit *
      PROFESSIONAL_WEIGHTS.scenarioFit +
    reliability *
      PROFESSIONAL_WEIGHTS.reliability +
    safety *
      PROFESSIONAL_WEIGHTS.safety +
    durability *
      PROFESSIONAL_WEIGHTS.durability +
    value *
      PROFESSIONAL_WEIGHTS.value;

  /**
   * Evidence confidence slightly adjusts the final score.
   *
   * We do NOT let evidence completely dominate the score,
   * but weak evidence should reduce confidence.
   */

  const evidenceMultiplier =
    0.9 +
    (evidenceConfidence / 100) * 0.1;

  total *= evidenceMultiplier;

  return {
    scenarioFit,
    reliability,
    safety,
    durability,
    value,
    evidenceConfidence,
    total: clampScore(total),
  };
}

/* =========================================================
   BUDGET SCORE
   ========================================================= */

export function calculateBudgetScore(
  product: ProductCandidate,
  profile: AdventureProfile
): ScoreBreakdown {
  const scenarioFit =
    calculateScenarioFit(
      product,
      profile
    );

  const reliability =
    clampScore(
      product.reliabilityScore
    );

  const safety =
    clampScore(
      product.safetyScore
    );

  const durability =
    clampScore(
      product.durabilityScore
    );

  const value =
    clampScore(
      product.valueScore
    );

  const evidenceConfidence =
    calculateEvidenceConfidence(
      product
    );

  const total =
    scenarioFit *
      BUDGET_WEIGHTS.scenarioFit +
    reliability *
      BUDGET_WEIGHTS.reliability +
    safety *
      BUDGET_WEIGHTS.safety +
    durability *
      BUDGET_WEIGHTS.durability +
    value *
      BUDGET_WEIGHTS.value;

  return {
    scenarioFit,
    reliability,
    safety,
    durability,
    value,
    evidenceConfidence,
    total: clampScore(total),
  };
}

/* =========================================================
   PROFESSIONAL REASON GENERATOR
   ========================================================= */

function buildProfessionalReason(
  product: ProductCandidate,
  profile: AdventureProfile,
  score: ScoreBreakdown
): string {
  const reasons: string[] = [];

  if (score.scenarioFit >= 80) {
    reasons.push(
      "strong match for this trip profile"
    );
  }

  if (score.reliability >= 85) {
    reasons.push(
      "high reliability"
    );
  }

  if (score.safety >= 85) {
    reasons.push(
      "strong safety margin"
    );
  }

  if (score.durability >= 85) {
    reasons.push(
      "high durability"
    );
  }

  if (
    profile.trip === "remote" &&
    score.reliability >= 80
  ) {
    reasons.push(
      "well suited to remote travel"
    );
  }

  if (reasons.length === 0) {
    reasons.push(
      "balanced performance across the main evaluation criteria"
    );
  }

  return (
    `${product.name} is recommended because it offers ` +
    reasons.join(", ") +
    "."
  );
}

/* =========================================================
   PROFESSIONAL CATEGORY ENGINE

   Returns ONE recommendation only.
   ========================================================= */

export function recommendProfessionalProduct(
  category: string,
  products: ProductCandidate[],
  profile: AdventureProfile
): ProductRecommendation | null {
  const candidates =
    products.filter(
      (product) =>
        product.category === category
    );

  if (candidates.length === 0) {
    return null;
  }

  const ranked =
    candidates
      .map((product) => {
        const score =
          calculateProfessionalScore(
            product,
            profile
          );

        return {
          product,
          score,
        };
      })
      .sort(
        (a, b) =>
          b.score.total -
          a.score.total
      );

  const best = ranked[0];

  return {
    category,
    product: best.product,
    score: best.score,
    reason:
      buildProfessionalReason(
        best.product,
        profile,
        best.score
      ),
    confidence:
      best.score.evidenceConfidence,
    evidence:
      best.product.evidence || [],
  };
}

/* =========================================================
   BUDGET CATEGORY ENGINE

   Returns up to THREE recommendations.

   Product affordability is handled here.

   Later we will improve this by allocating the TOTAL budget
   intelligently across categories instead of using a simple
   category budget.
   ========================================================= */

export function recommendBudgetProducts(
  category: string,
  products: ProductCandidate[],
  profile: AdventureProfile,
  categoryBudget: number
): ProductRecommendation[] {
  const candidates =
    products.filter(
      (product) =>
        product.category === category &&
        product.price <= categoryBudget
    );

  const ranked =
    candidates
      .map((product) => {
        const score =
          calculateBudgetScore(
            product,
            profile
          );

        return {
          category,
          product,
          score,
          reason:
            `${product.name} provides a strong balance of ` +
            `scenario fit, reliability and value within this budget.`,
          confidence:
            score.evidenceConfidence,
          evidence:
            product.evidence || [],
        };
      })
      .sort(
        (a, b) =>
          b.score.total -
          a.score.total
      );

  return ranked.slice(0, 3);
}

/* =========================================================
   SIMPLE BUDGET ALLOCATION V1

   This is intentionally simple for now.

   Later this should become category-aware:
   Power, Safety and Sleeping should receive different
   allocation rules.
   ========================================================= */

export function allocateBudgetPerCategory(
  totalBudget: number,
  categories: SelectedGearCategory[]
): Record<string, number> {
  if (
    totalBudget <= 0 ||
    categories.length === 0
  ) {
    return {};
  }

  const weights: Record<
    GearPriority,
    number
  > = {
    essential: 3,
    recommended: 2,
    optional: 1,
  };

  const totalWeight =
    categories.reduce(
      (sum, category) =>
        sum +
        weights[category.priority],
      0
    );

  const allocations: Record<
    string,
    number
  > = {};

  categories.forEach(
    (category) => {
      const weight =
        weights[category.priority];

      allocations[category.name] =
        (totalBudget * weight) /
        totalWeight;
    }
  );

  return allocations;
}

/* =========================================================
   PROFESSIONAL BUDGET ESTIMATION V1

   Temporary baseline.

   Later this will use category-specific expected price bands.
   ========================================================= */

export function estimateProfessionalBudget(
  categories: SelectedGearCategory[]
): number {
  const defaultBudgets: Record<
    GearPriority,
    number
  > = {
    essential: 180,
    recommended: 120,
    optional: 70,
  };

  return categories.reduce(
    (total, category) =>
      total +
      defaultBudgets[
        category.priority
      ],
    0
  );
}

/* =========================================================
   FULL PROFESSIONAL SYSTEM
   ========================================================= */

export function buildProfessionalSystem(
  profile: AdventureProfile,
  categories: SelectedGearCategory[],
  products: ProductCandidate[]
): RecommendationSystemResult {
  const resultCategories:
    CategoryRecommendation[] = [];

  categories.forEach(
    (category) => {
      const recommendation =
        recommendProfessionalProduct(
          category.name,
          products,
          profile
        );

      resultCategories.push({
        category: category.name,
        priority: category.priority,
        recommendations:
          recommendation
            ? [recommendation]
            : [],
      });
    }
  );

  const estimatedTotal =
    resultCategories.reduce(
      (total, category) => {
        const product =
          category.recommendations[0]
            ?.product;

        return (
          total +
          (product?.price || 0)
        );
      },
      0
    );

  return {
    mode: "professional",

    profile,

    estimatedProfessionalBudget:
      estimateProfessionalBudget(
        categories
      ),

    categories:
      resultCategories,

    estimatedTotal,
  };
}

/* =========================================================
   FULL BUDGET SYSTEM
   ========================================================= */

export function buildBudgetSystem(
  profile: AdventureProfile,
  categories: SelectedGearCategory[],
  products: ProductCandidate[],
  totalBudget: number
): RecommendationSystemResult {
  const allocations =
    allocateBudgetPerCategory(
      totalBudget,
      categories
    );

  const resultCategories:
    CategoryRecommendation[] =
      categories.map(
        (category) => {
          const categoryBudget =
            allocations[
              category.name
            ] || 0;

          const recommendations =
            recommendBudgetProducts(
              category.name,
              products,
              profile,
              categoryBudget
            );

          return {
            category:
              category.name,

            priority:
              category.priority,

            categoryBudget,

            recommendations,
          };
        }
      );

  /**
   * For now, estimated total assumes the first ranked
   * product from each category.
   */

  const estimatedTotal =
    resultCategories.reduce(
      (total, category) => {
        const product =
          category.recommendations[0]
            ?.product;

        return (
          total +
          (product?.price || 0)
        );
      },
      0
    );

  return {
    mode: "budget",

    profile,

    totalBudget,

    categories:
      resultCategories,

    estimatedTotal,
  };
}
