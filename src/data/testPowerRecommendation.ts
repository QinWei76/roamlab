import {
  recommendBudgetProducts,
  recommendProfessionalProduct,
  type AdventureProfile,
} from "@/data/productRecommendationEngine";

import {
  powerProducts,
} from "@/data/products/powerProducts";

/* =========================================================
   ROAMLAB POWER RECOMMENDATION TEST — V1

   Test Profile:
   CROSSOVER / AWD
   REMOTE / OFF-GRID
   FRIENDS
   5 PEOPLE
   4–7 NIGHTS
   ========================================================= */

export const testProfile: AdventureProfile = {
  vehicle: "crossover",
  trip: "remote",
  crew: "friends",
  people: 5,
  duration: "multi-day",
};

/* =========================================================
   PROFESSIONAL SETUP TEST

   RoamLab chooses ONE product.
   ========================================================= */

export const professionalPowerTest =
  recommendProfessionalProduct(
    "Power",
    powerProducts,
    testProfile
  );

/* =========================================================
   BUDGET SETUP TEST

   For this first test we give the Power category
   a maximum budget of $800.

   The engine can return up to THREE products.
   ========================================================= */

export const budgetPowerTest =
  recommendBudgetProducts(
    "Power",
    powerProducts,
    testProfile,
    800
  );

/* =========================================================
   SIMPLE READABLE OUTPUT
   ========================================================= */

export const professionalPowerResult =
  professionalPowerTest
    ? {
        mode: "ROAMLAB PROFESSIONAL",

        product:
          professionalPowerTest.product
            .name,

        brand:
          professionalPowerTest.product
            .brand,

        price:
          professionalPowerTest.product
            .price,

        totalScore:
          Number(
            professionalPowerTest.score.total.toFixed(
              1
            )
          ),

        scenarioFit:
          professionalPowerTest.score
            .scenarioFit,

        reliability:
          professionalPowerTest.score
            .reliability,

        safety:
          professionalPowerTest.score
            .safety,

        durability:
          professionalPowerTest.score
            .durability,

        value:
          professionalPowerTest.score
            .value,

        evidenceConfidence:
          Number(
            professionalPowerTest.score
              .evidenceConfidence.toFixed(
                1
              )
          ),

        reason:
          professionalPowerTest.reason,
      }
    : null;

/* =========================================================
   BUDGET TOP 3 READABLE OUTPUT
   ========================================================= */

export const budgetPowerResults =
  budgetPowerTest.map(
    (recommendation, index) => ({
      rank: index + 1,

      mode: "USER BUDGET",

      product:
        recommendation.product.name,

      brand:
        recommendation.product.brand,

      price:
        recommendation.product.price,

      totalScore:
        Number(
          recommendation.score.total.toFixed(
            1
          )
        ),

      scenarioFit:
        recommendation.score
          .scenarioFit,

      reliability:
        recommendation.score
          .reliability,

      safety:
        recommendation.score
          .safety,

      durability:
        recommendation.score
          .durability,

      value:
        recommendation.score.value,

      evidenceConfidence:
        Number(
          recommendation.score
            .evidenceConfidence.toFixed(
              1
            )
        ),

      reason:
        recommendation.reason,
    })
  );

/* =========================================================
   OPTIONAL CONSOLE OUTPUT

   This makes it easier to inspect locally later.
   It does not affect the recommendation logic.
   ========================================================= */

export function printPowerRecommendationTest() {
  console.log(
    "================================"
  );

  console.log(
    "ROAMLAB POWER ENGINE TEST"
  );

  console.log(
    "================================"
  );

  console.log(
    "PROFILE:",
    testProfile
  );

  console.log(
    "--------------------------------"
  );

  console.log(
    "PROFESSIONAL:",
    professionalPowerResult
  );

  console.log(
    "--------------------------------"
  );

  console.log(
    "BUDGET TOP 3:",
    budgetPowerResults
  );

  console.log(
    "================================"
  );
}
