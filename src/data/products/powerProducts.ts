import type {
  ProductCandidate,
} from "@/data/productRecommendationEngine";

/* =========================================================
   ROAMLAB POWER PRODUCT DATABASE — V1

   Category:
   Power

   IMPORTANT:
   - Prices are reference prices and may change.
   - Manufacturer specifications are recorded as evidence.
   - RoamLab scores are internal v1 evaluation inputs.
   - Scores are NOT claims of independent field testing.
   ========================================================= */

export const powerProducts: ProductCandidate[] = [
  /* =======================================================
     ECOFLOW DELTA 3 PLUS
     ======================================================= */

  {
    id: "ecoflow-delta-3-plus",

    name: "EcoFlow DELTA 3 Plus",

    brand: "EcoFlow",

    category: "Power",

    price: 719,

    currency: "USD",

    productUrl:
      "https://us.ecoflow.com/products/delta-3-plus-portable-power-station",

    reliabilityScore: 91,
    durabilityScore: 90,
    safetyScore: 91,
    valueScore: 84,

    portabilityScore: 84,
    capacityScore: 88,
    easeOfUseScore: 92,

    maxPeople: 6,

    suitableVehicles: [
      "suv",
      "truck",
      "van",
      "crossover",
    ],

    suitableTrips: [
      "weekend",
      "road-trip",
      "basecamp",
      "remote",
    ],

    suitableDurations: [
      "weekend",
      "multi-day",
      "extended",
    ],

    suitableCrews: [
      "solo",
      "couple",
      "family",
      "friends",
    ],

    evidence: [
      {
        type: "manufacturer",
        title:
          "1024Wh capacity and 1800W AC output",
        source: "EcoFlow",
        url:
          "https://us.ecoflow.com/products/delta-3-plus-portable-power-station",
        confidence: 90,
      },

      {
        type: "manufacturer",
        title:
          "LFP battery with 4000 cycles to 80%+ capacity",
        source: "EcoFlow",
        url:
          "https://us.ecoflow.com/products/delta-3-plus-portable-power-station",
        confidence: 90,
      },

      {
        type: "certification",
        title:
          "SGS fast and safe charging certification referenced by EcoFlow",
        source: "EcoFlow / SGS",
        url:
          "https://us.ecoflow.com/products/delta-3-plus-portable-power-station",
        confidence: 85,
      },
    ],
  },

  /* =======================================================
     JACKERY EXPLORER 1000 V2
     ======================================================= */

  {
    id: "jackery-explorer-1000-v2",

    name: "Jackery Explorer 1000 v2",

    brand: "Jackery",

    category: "Power",

    price: 589,

    currency: "USD",

    productUrl:
      "https://www.jackery.com/products/jackery-explorer-1000-v2",

    reliabilityScore: 90,
    durabilityScore: 89,
    safetyScore: 91,
    valueScore: 90,

    portabilityScore: 92,
    capacityScore: 88,
    easeOfUseScore: 92,

    maxPeople: 5,

    suitableVehicles: [
      "suv",
      "truck",
      "van",
      "crossover",
      "city",
    ],

    suitableTrips: [
      "weekend",
      "road-trip",
      "basecamp",
      "remote",
    ],

    suitableDurations: [
      "overnight",
      "weekend",
      "multi-day",
    ],

    suitableCrews: [
      "solo",
      "couple",
      "family",
      "friends",
    ],

    evidence: [
      {
        type: "manufacturer",
        title:
          "1070Wh capacity and 1500W output",
        source: "Jackery",
        url:
          "https://www.jackery.com/products/jackery-explorer-1000-v2",
        confidence: 90,
      },

      {
        type: "manufacturer",
        title:
          "LiFePO4 battery rated for 4000 charge cycles",
        source: "Jackery",
        url:
          "https://www.jackery.com/products/jackery-explorer-1000-v2",
        confidence: 90,
      },

      {
        type: "manufacturer",
        title:
          "ChargeShield 2.0 protection system",
        source: "Jackery",
        url:
          "https://www.jackery.com/products/jackery-explorer-1000-v2",
        confidence: 85,
      },
    ],
  },

  /* =======================================================
     BLUETTI AC180
     ======================================================= */

  {
    id: "bluetti-ac180",

    name: "BLUETTI AC180",

    brand: "BLUETTI",

    category: "Power",

    price: 499,

    currency: "USD",

    productUrl:
      "https://www.bluettipower.com/products/ac180",

    reliabilityScore: 88,
    durabilityScore: 89,
    safetyScore: 88,
    valueScore: 94,

    portabilityScore: 72,
    capacityScore: 92,
    easeOfUseScore: 86,

    maxPeople: 6,

    suitableVehicles: [
      "suv",
      "truck",
      "van",
      "crossover",
    ],

    suitableTrips: [
      "weekend",
      "road-trip",
      "basecamp",
      "remote",
    ],

    suitableDurations: [
      "weekend",
      "multi-day",
      "extended",
    ],

    suitableCrews: [
      "couple",
      "family",
      "friends",
    ],

    evidence: [
      {
        type: "manufacturer",
        title:
          "1152Wh capacity and 1800W AC output",
        source: "BLUETTI",
        url:
          "https://www.bluettipower.com/products/ac180",
        confidence: 90,
      },

      {
        type: "manufacturer",
        title:
          "LiFePO4 battery rated for 3500+ cycles",
        source: "BLUETTI",
        url:
          "https://www.bluettipower.com/products/ac180",
        confidence: 90,
      },

      {
        type: "manufacturer",
        title:
          "500W maximum solar input",
        source: "BLUETTI",
        url:
          "https://www.bluettipower.com/products/ac180",
        confidence: 90,
      },
    ],
  },

  /* =======================================================
     DJI POWER 1000
     ======================================================= */

  {
    id: "dji-power-1000",

    name: "DJI Power 1000",

    brand: "DJI",

    category: "Power",

    price: 699,

    currency: "USD",

    productUrl:
      "https://store.dji.com/product/dji-power-1000",

    reliabilityScore: 93,
    durabilityScore: 91,
    safetyScore: 95,
    valueScore: 84,

    portabilityScore: 82,
    capacityScore: 88,
    easeOfUseScore: 89,

    maxPeople: 6,

    suitableVehicles: [
      "suv",
      "truck",
      "van",
      "crossover",
    ],

    suitableTrips: [
      "weekend",
      "road-trip",
      "basecamp",
      "remote",
    ],

    suitableDurations: [
      "weekend",
      "multi-day",
      "extended",
    ],

    suitableCrews: [
      "solo",
      "couple",
      "family",
      "friends",
    ],

    evidence: [
      {
        type: "manufacturer",
        title:
          "1024Wh capacity and 2200W continuous AC output",
        source: "DJI",
        url:
          "https://www.dji.com/power-1000/specs",
        confidence: 95,
      },

      {
        type: "manufacturer",
        title:
          "LFP battery rated for 4000 cycles",
        source: "DJI",
        url:
          "https://www.dji.com/power-1000/specs",
        confidence: 95,
      },

      {
        type: "certification",
        title:
          "26 product test certifications from SGS",
        source: "DJI / SGS",
        url:
          "https://store.dji.com/product/dji-power-1000",
        confidence: 90,
      },
    ],
  },

  /* =======================================================
     ANKER SOLIX C1000 GEN 2
     ======================================================= */

  {
    id: "anker-solix-c1000-gen2",

    name: "Anker SOLIX C1000 Gen 2",

    brand: "Anker",

    category: "Power",

    price: 999,

    currency: "USD",

    /*
     Price placeholder:
     Current verified official source was European pricing.
     Replace this USD reference once US pricing is verified.
    */

    reliabilityScore: 92,
    durabilityScore: 92,
    safetyScore: 91,
    valueScore: 78,

    portabilityScore: 88,
    capacityScore: 88,
    easeOfUseScore: 92,

    maxPeople: 6,

    suitableVehicles: [
      "suv",
      "truck",
      "van",
      "crossover",
    ],

    suitableTrips: [
      "weekend",
      "road-trip",
      "basecamp",
      "remote",
    ],

    suitableDurations: [
      "weekend",
      "multi-day",
      "extended",
    ],

    suitableCrews: [
      "solo",
      "couple",
      "family",
      "friends",
    ],

    evidence: [
      {
        type: "manufacturer",
        title:
          "1024Wh capacity and 2000W output",
        source: "Anker",
        url:
          "https://www.anker.com/products/c1000-gen2",
        confidence: 90,
      },

      {
        type: "manufacturer",
        title:
          "4000 cycles to at least 80% capacity",
        source: "Anker",
        url:
          "https://www.anker.com/products/c1000-gen2",
        confidence: 90,
      },

      {
        type: "manufacturer",
        title:
          "600W maximum solar charging",
        source: "Anker",
        url:
          "https://www.anker.com/products/c1000-gen2",
        confidence: 90,
      },
    ],
  },

  /* =======================================================
     ECOFLOW DELTA 2
     ======================================================= */

  {
    id: "ecoflow-delta-2",

    name: "EcoFlow DELTA 2",

    brand: "EcoFlow",

    category: "Power",

    price: 599,

    currency: "USD",

    productUrl:
      "https://www.ecoflow.com/us/delta-2-portable-power-station",

    reliabilityScore: 88,
    durabilityScore: 87,
    safetyScore: 88,
    valueScore: 88,

    portabilityScore: 84,
    capacityScore: 87,
    easeOfUseScore: 90,

    maxPeople: 5,

    suitableVehicles: [
      "suv",
      "truck",
      "van",
      "crossover",
      "city",
    ],

    suitableTrips: [
      "weekend",
      "road-trip",
      "basecamp",
    ],

    suitableDurations: [
      "overnight",
      "weekend",
      "multi-day",
    ],

    suitableCrews: [
      "solo",
      "couple",
      "family",
      "friends",
    ],

    evidence: [
      {
        type: "manufacturer",
        title:
          "1024Wh capacity and 1800W AC output",
        source: "EcoFlow",
        url:
          "https://www.ecoflow.com/us/delta-2-portable-power-station",
        confidence: 90,
      },

      {
        type: "manufacturer",
        title:
          "LiFePO4 battery with 3000 cycles to 80%+ capacity",
        source: "EcoFlow",
        url:
          "https://www.ecoflow.com/us/delta-2-portable-power-station",
        confidence: 90,
      },

      {
        type: "manufacturer",
        title:
          "500W maximum solar input",
        source: "EcoFlow",
        url:
          "https://www.ecoflow.com/us/delta-2-portable-power-station",
        confidence: 90,
      },
    ],
  },
];
