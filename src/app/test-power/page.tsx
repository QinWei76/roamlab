import {
  professionalPowerResult,
  budgetPowerResults,
  testProfile,
} from "@/data/testPowerRecommendation";

import {
  calculatePowerRequirement,
  calculatePowerScenarioFit,
  powerProductSpecs,
} from "@/data/powerRecommendationModel";

import {
  powerProducts,
} from "@/data/products/powerProducts";

export default function TestPowerPage() {
  const requirement =
    calculatePowerRequirement(testProfile);

  const v2Results = powerProducts.map(
    (product) => {
      const result =
        calculatePowerScenarioFit(
          product,
          testProfile
        );

      return {
        product,
        result,
      };
    }
  );

  const sortedV2Results = [...v2Results].sort(
    (a, b) =>
      b.result.scenarioFit -
      a.result.scenarioFit
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "#f5f5f5",
        padding: "40px 24px 80px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      >
        <Header />

        <AdventureProfile />

        <PowerRequirementPanel
          requirement={requirement}
        />

        <V2Comparison
          results={sortedV2Results}
        />

        <OldV1Results />
      </div>
    </main>
  );
}

function Header() {
  return (
    <div
      style={{
        marginBottom: "40px",
      }}
    >
      <p
        style={{
          fontSize: "12px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          opacity: 0.6,
          marginBottom: "10px",
        }}
      >
        ROAMLAB
      </p>

      <h1
        style={{
          fontSize: "38px",
          margin: 0,
          marginBottom: "12px",
        }}
      >
        Power Recommendation Engine V2
      </h1>

      <p
        style={{
          opacity: 0.7,
          lineHeight: 1.6,
          maxWidth: "800px",
        }}
      >
        V1 used general product suitability.
        V2 calculates real power requirements
        and compares technical capability.
      </p>
    </div>
  );
}

function AdventureProfile() {
  return (
    <section
      style={{
        padding: "22px",
        border: "1px solid #333",
        borderRadius: "14px",
        marginBottom: "28px",
        background: "#181818",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          marginTop: 0,
        }}
      >
        Test Adventure Profile
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "14px",
        }}
      >
        <ProfileItem
          label="Vehicle"
          value={testProfile.vehicle}
        />

        <ProfileItem
          label="Trip"
          value={testProfile.trip}
        />

        <ProfileItem
          label="Crew"
          value={testProfile.crew}
        />

        <ProfileItem
          label="People"
          value={String(
            testProfile.people
          )}
        />

        <ProfileItem
          label="Duration"
          value={
            testProfile.duration
          }
        />
      </div>
    </section>
  );
}

function PowerRequirementPanel({
  requirement,
}: {
  requirement: {
    targetCapacityWh: number;
    minimumAcOutputW: number;
    targetSolarInputW: number;
    targetAcRechargeW: number;
    maxRecommendedWeightKg: number;
    targetCycleLife: number;
    remoteReservePercent: number;
  };
}) {
  return (
    <section
      style={{
        padding: "22px",
        border: "1px solid #333",
        borderRadius: "14px",
        marginBottom: "42px",
        background: "#181818",
      }}
    >
      <p
        style={{
          fontSize: "12px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: 0.55,
          marginTop: 0,
          marginBottom: "8px",
        }}
      >
        Power Requirement Engine
      </p>

      <h2
        style={{
          fontSize: "25px",
          marginTop: 0,
          marginBottom: "20px",
        }}
      >
        Calculated Technical Target
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
        }}
      >
        <RequirementItem
          label="Target Capacity"
          value={`${requirement.targetCapacityWh} Wh`}
        />

        <RequirementItem
          label="Min AC Output"
          value={`${requirement.minimumAcOutputW} W`}
        />

        <RequirementItem
          label="Target Solar"
          value={`${requirement.targetSolarInputW} W`}
        />

        <RequirementItem
          label="Target AC Recharge"
          value={`${requirement.targetAcRechargeW} W`}
        />

        <RequirementItem
          label="Weight Target"
          value={`${requirement.maxRecommendedWeightKg} kg`}
        />

        <RequirementItem
          label="Cycle Life"
          value={`${requirement.targetCycleLife}`}
        />

        <RequirementItem
          label="Remote Reserve"
          value={`${requirement.remoteReservePercent}%`}
        />
      </div>
    </section>
  );
}

function V2Comparison({
  results,
}: {
  results: ReturnType<
    typeof calculatePowerScenarioFit
  > extends infer T
    ? {
        product:
          (typeof powerProducts)[number];
        result: T;
      }[]
    : never;
}) {
  return (
    <section
      style={{
        marginBottom: "60px",
      }}
    >
      <p
        style={{
          fontSize: "12px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: 0.55,
          marginBottom: "8px",
        }}
      >
        Power-Specific Model
      </p>

      <h2
        style={{
          fontSize: "30px",
          marginTop: 0,
          marginBottom: "8px",
        }}
      >
        V2 Scenario Fit Ranking
      </h2>

      <p
        style={{
          opacity: 0.65,
          marginTop: 0,
          marginBottom: "24px",
        }}
      >
        Ranked only by Power Scenario Fit V2.
      </p>

      <div
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        {results.map(
          (
            { product, result },
            index
          ) => {
            const specs =
              powerProductSpecs[
                product.id
              ];

            return (
              <div
                key={product.id}
                style={{
                  border:
                    "1px solid #333",
                  borderRadius: "14px",
                  padding: "24px",
                  background: "#181818",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    gap: "20px",
                    flexWrap: "wrap",
                    marginBottom:
                      "22px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize:
                          "12px",
                        opacity: 0.55,
                        letterSpacing:
                          "0.12em",
                        marginBottom:
                          "8px",
                      }}
                    >
                      #{index + 1}
                    </div>

                    <h3
                      style={{
                        fontSize:
                          "24px",
                        margin: 0,
                        marginBottom:
                          "6px",
                      }}
                    >
                      {product.name}
                    </h3>

                    <div
                      style={{
                        opacity: 0.6,
                      }}
                    >
                      {product.brand}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign:
                        "right",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "32px",
                        fontWeight: 700,
                      }}
                    >
                      {
                        result.scenarioFit
                      }
                    </div>

                    <div
                      style={{
                        fontSize:
                          "11px",
                        opacity: 0.5,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.12em",
                      }}
                    >
                      V2 Scenario Fit
                    </div>
                  </div>
                </div>

                {specs && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(135px, 1fr))",
                      gap: "10px",
                      marginBottom:
                        "20px",
                    }}
                  >
                    <SpecItem
                      label="Capacity"
                      value={`${specs.capacityWh} Wh`}
                    />

                    <SpecItem
                      label="AC Output"
                      value={`${specs.continuousOutputW} W`}
                    />

                    <SpecItem
                      label="Solar"
                      value={`${specs.maxSolarInputW} W`}
                    />

                    <SpecItem
                      label="AC Recharge"
                      value={`${specs.maxAcRechargeW} W`}
                    />

                    <SpecItem
                      label="Weight"
                      value={`${specs.weightKg} kg`}
                    />

                    <SpecItem
                      label="Cycle Life"
                      value={`${specs.cycleLife}`}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "12px",
                  }}
                >
                  <ScoreItem
                    label="Capacity Fit"
                    value={
                      result.breakdown
                        .capacityFit
                    }
                  />

                  <ScoreItem
                    label="Output Fit"
                    value={
                      result.breakdown
                        .outputFit
                    }
                  />

                  <ScoreItem
                    label="Solar Fit"
                    value={
                      result.breakdown
                        .solarFit
                    }
                  />

                  <ScoreItem
                    label="Recharge Fit"
                    value={
                      result.breakdown
                        .rechargeFit
                    }
                  />

                  <ScoreItem
                    label="Portability"
                    value={
                      result.breakdown
                        .portabilityFit
                    }
                  />

                  <ScoreItem
                    label="Cycle Life"
                    value={
                      result.breakdown
                        .cycleLifeFit
                    }
                  />
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}

function OldV1Results() {
  return (
    <section
      style={{
        borderTop: "1px solid #333",
        paddingTop: "42px",
      }}
    >
      <p
        style={{
          fontSize: "12px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: 0.45,
          marginBottom: "8px",
        }}
      >
        Reference
      </p>

      <h2
        style={{
          fontSize: "28px",
          marginTop: 0,
        }}
      >
        Previous V1 Output
      </h2>

      <p
        style={{
          opacity: 0.6,
          lineHeight: 1.6,
          maxWidth: "800px",
        }}
      >
        These results still use the
        original generic recommendation
        engine and are shown only for
        comparison.
      </p>

      <div
        style={{
          display: "grid",
          gap: "18px",
          marginTop: "22px",
        }}
      >
        {professionalPowerResult && (
          <V1Card
            label="Professional"
            product={
              professionalPowerResult.product
            }
            score={
              professionalPowerResult.totalScore
            }
            scenarioFit={
              professionalPowerResult.scenarioFit
            }
          />
        )}

        {budgetPowerResults.map(
          (item) => (
            <V1Card
              key={`${item.rank}-${item.product}`}
              label={`Budget #${item.rank}`}
              product={item.product}
              score={item.totalScore}
              scenarioFit={
                item.scenarioFit
              }
            />
          )
        )}
      </div>
    </section>
  );
}

function V1Card({
  label,
  product,
  score,
  scenarioFit,
}: {
  label: string;
  product: string;
  score: number;
  scenarioFit: number;
}) {
  return (
    <div
      style={{
        padding: "18px 20px",
        background: "#181818",
        border:
          "1px solid #2f2f2f",
        borderRadius: "12px",
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "11px",
            opacity: 0.5,
            textTransform:
              "uppercase",
            letterSpacing:
              "0.1em",
            marginBottom: "5px",
          }}
        >
          {label}
        </div>

        <strong>
          {product}
        </strong>
      </div>

      <div
        style={{
          display: "flex",
          gap: "26px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              opacity: 0.45,
            }}
          >
            V1 Scenario
          </div>

          <strong>
            {scenarioFit}
          </strong>
        </div>

        <div>
          <div
            style={{
              fontSize: "11px",
              opacity: 0.45,
            }}
          >
            Total
          </div>

          <strong>
            {score}
          </strong>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "14px",
        background: "#202020",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          opacity: 0.5,
          marginBottom: "6px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "16px",
          textTransform: "uppercase",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function RequirementItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "14px",
        background: "#202020",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          opacity: 0.5,
          marginBottom: "6px",
        }}
      >
        {label}
      </div>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function SpecItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "11px",
        background: "#151515",
        border:
          "1px solid #2a2a2a",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          opacity: 0.45,
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "14px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ScoreItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        background: "#202020",
        borderRadius: "9px",
        padding: "12px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          opacity: 0.5,
          marginBottom: "6px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "18px",
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}
