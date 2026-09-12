import {
  professionalPowerResult,
  budgetPowerResults,
  testProfile,
} from "@/data/testPowerRecommendation";

export default function TestPowerPage() {
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
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
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
              fontSize: "36px",
              margin: 0,
              marginBottom: "12px",
            }}
          >
            Power Recommendation Engine Test
          </h1>

          <p
            style={{
              opacity: 0.7,
              lineHeight: 1.6,
              maxWidth: "760px",
            }}
          >
            This page shows the first real output
            from the RoamLab recommendation engine.
          </p>
        </div>

        <section
          style={{
            padding: "22px",
            border: "1px solid #333",
            borderRadius: "14px",
            marginBottom: "36px",
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
              value={String(testProfile.people)}
            />

            <ProfileItem
              label="Duration"
              value={testProfile.duration}
            />
          </div>
        </section>

        <section
          style={{
            marginBottom: "48px",
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
            Professional Setup
          </p>

          <h2
            style={{
              fontSize: "28px",
              marginTop: 0,
              marginBottom: "20px",
            }}
          >
            RoamLab Professional Choice
          </h2>

          {professionalPowerResult ? (
            <RecommendationCard
              rank="TOP 1"
              product={
                professionalPowerResult.product
              }
              brand={
                professionalPowerResult.brand
              }
              price={
                professionalPowerResult.price
              }
              totalScore={
                professionalPowerResult.totalScore
              }
              scenarioFit={
                professionalPowerResult.scenarioFit
              }
              reliability={
                professionalPowerResult.reliability
              }
              safety={
                professionalPowerResult.safety
              }
              durability={
                professionalPowerResult.durability
              }
              value={
                professionalPowerResult.value
              }
              evidenceConfidence={
                professionalPowerResult.evidenceConfidence
              }
              reason={
                professionalPowerResult.reason
              }
            />
          ) : (
            <p>No professional result.</p>
          )}
        </section>

        <section>
          <p
            style={{
              fontSize: "12px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              opacity: 0.6,
              marginBottom: "10px",
            }}
          >
            User Budget Setup
          </p>

          <h2
            style={{
              fontSize: "28px",
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            Budget Top 3
          </h2>

          <p
            style={{
              marginTop: 0,
              opacity: 0.65,
              marginBottom: "22px",
            }}
          >
            Power category budget: $800
          </p>

          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            {budgetPowerResults.length > 0 ? (
              budgetPowerResults.map(
                (item) => (
                  <RecommendationCard
                    key={`${item.rank}-${item.product}`}
                    rank={`#${item.rank}`}
                    product={item.product}
                    brand={item.brand}
                    price={item.price}
                    totalScore={
                      item.totalScore
                    }
                    scenarioFit={
                      item.scenarioFit
                    }
                    reliability={
                      item.reliability
                    }
                    safety={item.safety}
                    durability={
                      item.durability
                    }
                    value={item.value}
                    evidenceConfidence={
                      item.evidenceConfidence
                    }
                    reason={item.reason}
                  />
                )
              )
            ) : (
              <p>
                No products fit the current
                budget.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
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

function RecommendationCard({
  rank,
  product,
  brand,
  price,
  totalScore,
  scenarioFit,
  reliability,
  safety,
  durability,
  value,
  evidenceConfidence,
  reason,
}: {
  rank: string;
  product: string;
  brand: string;
  price: number;
  totalScore: number;
  scenarioFit: number;
  reliability: number;
  safety: number;
  durability: number;
  value: number;
  evidenceConfidence: number;
  reason: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #333",
        borderRadius: "14px",
        padding: "24px",
        background: "#181818",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "0.15em",
              opacity: 0.55,
              marginBottom: "8px",
            }}
          >
            {rank}
          </div>

          <h3
            style={{
              fontSize: "24px",
              margin: 0,
              marginBottom: "8px",
            }}
          >
            {product}
          </h3>

          <div
            style={{
              opacity: 0.65,
            }}
          >
            {brand}
          </div>
        </div>

        <div
          style={{
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            {totalScore}
          </div>

          <div
            style={{
              fontSize: "11px",
              opacity: 0.5,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Total Score
          </div>

          <div
            style={{
              marginTop: "10px",
              fontSize: "16px",
            }}
          >
            ${price}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          marginBottom: "22px",
        }}
      >
        <ScoreItem
          label="Scenario Fit"
          value={scenarioFit}
        />

        <ScoreItem
          label="Reliability"
          value={reliability}
        />

        <ScoreItem
          label="Safety"
          value={safety}
        />

        <ScoreItem
          label="Durability"
          value={durability}
        />

        <ScoreItem
          label="Value"
          value={value}
        />

        <ScoreItem
          label="Evidence"
          value={evidenceConfidence}
        />
      </div>

      <div
        style={{
          borderTop: "1px solid #2b2b2b",
          paddingTop: "18px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            opacity: 0.5,
            marginBottom: "8px",
          }}
        >
          Recommendation Reason
        </div>

        <p
          style={{
            margin: 0,
            lineHeight: 1.65,
            opacity: 0.8,
          }}
        >
          {reason}
        </p>
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
