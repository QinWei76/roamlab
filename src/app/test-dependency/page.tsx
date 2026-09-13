import {
  userATestResult,
  userBTestResult,
  dependencyComparison,
} from "@/data/testGearDependency";

export default function TestDependencyPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f1eb",
        color: "#111111",
        padding: "48px 24px 80px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "0.18em",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            ROAMLAB SYSTEM ENGINE TEST
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "42px",
              lineHeight: 1.05,
              fontWeight: 700,
              maxWidth: "900px",
            }}
          >
            Same Budget.
            <br />
            Different Gear.
            <br />
            Different Power Requirement.
          </h1>

          <p
            style={{
              marginTop: "20px",
              marginBottom: 0,
              maxWidth: "760px",
              fontSize: "17px",
              lineHeight: 1.6,
              color: "#555",
            }}
          >
            Both users have the same trip
            profile and the same $3000 budget.
            Their existing gear and planned
            equipment are different, so their
            actual system requirements should
            also be different.
          </p>
        </div>

        {/* =================================================
            SHARED PROFILE
        ================================================= */}

        <section
          style={{
            background: "#111",
            color: "#fff",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.16em",
              opacity: 0.65,
              marginBottom: "14px",
            }}
          >
            SHARED ADVENTURE PROFILE
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "18px",
            }}
          >
            <Metric
              label="Vehicle"
              value="Crossover"
              dark
            />

            <Metric
              label="Trip"
              value="Remote"
              dark
            />

            <Metric
              label="Crew"
              value="Friends"
              dark
            />

            <Metric
              label="People"
              value="5"
              dark
            />

            <Metric
              label="Duration"
              value="Multi-day"
              dark
            />

            <Metric
              label="Budget"
              value="$3000"
              dark
            />
          </div>
        </section>

        {/* =================================================
            USER A / USER B
        ================================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          <UserCard
            title="USER A"
            subtitle="Propane Cooking System"
            result={userATestResult}
          />

          <UserCard
            title="USER B"
            subtitle="Electric Cooking System"
            result={userBTestResult}
          />
        </div>

        {/* =================================================
            COMPARISON
        ================================================= */}

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #d8d5ce",
            padding: "28px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.16em",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            SYSTEM COMPARISON
          </div>

          <h2
            style={{
              margin: "0 0 26px",
              fontSize: "28px",
            }}
          >
            Same budget does not mean
            same power system.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
            }}
          >
            <ComparisonBox
              label="Same Budget"
              value={
                dependencyComparison.sameBudget
                  ? "YES"
                  : "NO"
              }
            />

            <ComparisonBox
              label="Same Trip Profile"
              value={
                dependencyComparison.sameAdventureProfile
                  ? "YES"
                  : "NO"
              }
            />

            <ComparisonBox
              label="User A Daily Load"
              value={`${dependencyComparison.userA.dailyWh} Wh/day`}
            />

            <ComparisonBox
              label="User B Daily Load"
              value={`${dependencyComparison.userB.dailyWh} Wh/day`}
            />

            <ComparisonBox
              label="Daily Load Difference"
              value={`+${dependencyComparison.difference.dailyWh} Wh/day`}
            />

            <ComparisonBox
              label="Peak Output Difference"
              value={`+${dependencyComparison.difference.peakAcLoadW} W`}
            />
          </div>
        </section>

        {/* =================================================
            BUDGET LOGIC
        ================================================= */}

        <section
          style={{
            background: "#e7e3d9",
            padding: "28px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.16em",
              fontWeight: 700,
              marginBottom: "10px",
            }}
          >
            BUDGET PRINCIPLE
          </div>

          <h2
            style={{
              margin: "0 0 18px",
              fontSize: "26px",
            }}
          >
            Budget is a ceiling,
            not a spending target.
          </h2>

          <p
            style={{
              margin: 0,
              maxWidth: "850px",
              lineHeight: 1.7,
              color: "#444",
            }}
          >
            RoamLab should first calculate
            what the trip actually requires.
            Only after the requirement is known
            should the system select equipment
            and check whether the total cost
            fits within the user&apos;s budget.
            If the mission can be safely achieved
            below budget, the remaining money
            should stay unspent unless it solves
            a meaningful system weakness.
          </p>
        </section>

        {/* =================================================
            ENGINE FLOW
        ================================================= */}

        <section
          style={{
            borderTop: "1px solid #bbb6aa",
            paddingTop: "32px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.16em",
              fontWeight: 700,
              marginBottom: "20px",
            }}
          >
            ROAMLAB RECOMMENDATION FLOW
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "10px",
            }}
          >
            {[
              "Adventure Profile",
              "Owned Gear",
              "Gear To Configure",
              "Dependency Analysis",
              "Actual Requirement",
              "Gap Analysis",
              "Mission-Capable Products",
              "Minimum Sufficient Cost",
              "Budget Check",
              "Remaining Budget",
            ].map((item, index) => (
              <div
                key={item}
                style={{
                  background: "#111",
                  color: "#fff",
                  minHeight: "92px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    opacity: 0.5,
                  }}
                >
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </span>

                <span
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.35,
                    fontWeight: 700,
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   USER CARD
========================================================= */

function UserCard({
  title,
  subtitle,
  result,
}: {
  title: string;
  subtitle: string;
  result: typeof userATestResult;
}) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #d8d5ce",
        padding: "26px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.16em",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <h2
        style={{
          fontSize: "27px",
          margin: "0 0 24px",
        }}
      >
        {subtitle}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "12px",
          marginBottom: "26px",
        }}
      >
        <Metric
          label="Daily Load"
          value={`${result.powerDemand.estimatedDailyWh} Wh`}
        />

        <Metric
          label="Peak Load"
          value={`${result.powerDemand.peakAcLoadW} W`}
        />

        <Metric
          label="Planned Spend"
          value={`$${result.budgetStatus.plannedSpend}`}
        />

        <Metric
          label="Remaining Budget"
          value={`$${result.budgetStatus.remainingBudget}`}
        />
      </div>

      <div
        style={{
          marginBottom: "22px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          SYSTEM
        </div>

        <div
          style={{
            fontSize: "14px",
            lineHeight: 1.7,
          }}
        >
          <div>
            Cooking:{" "}
            <strong>
              {result.system.cooking}
            </strong>
          </div>

          <div>
            Food Storage:{" "}
            <strong>
              {result.system.foodStorage}
            </strong>
          </div>
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          ACTIVE GEAR
        </div>

        <div
          style={{
            display: "grid",
            gap: "8px",
          }}
        >
          {result.activeGear.map(
            (item) => (
              <div
                key={`${item.name}-${item.status}`}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: "12px",
                  borderTop:
                    "1px solid #ece9e2",
                  paddingTop: "8px",
                  fontSize: "13px",
                }}
              >
                <span>
                  {item.name}
                </span>

                <span
                  style={{
                    textTransform:
                      "uppercase",
                    fontSize: "10px",
                    letterSpacing:
                      "0.1em",
                    fontWeight: 700,
                    color:
                      item.status ===
                      "owned"
                        ? "#555"
                        : "#111",
                  }}
                >
                  {item.status}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   METRIC
========================================================= */

function Metric({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: "5px",
          color: dark
            ? "rgba(255,255,255,0.55)"
            : "#777",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "18px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   COMPARISON BOX
========================================================= */

function ComparisonBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border:
          "1px solid #d8d5ce",
        padding: "18px",
        minHeight: "104px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#777",
          marginBottom: "14px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "22px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}
