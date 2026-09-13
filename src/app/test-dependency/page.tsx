import {
  userAState,
  userBState,
  userATestResult,
  userBTestResult,
  dependencyComparison,
  userAPowerGap,
  userBPowerGap,
} from "@/data/testGearDependency";

import {
  calculatePowerRequirement,
} from "@/data/powerRequirementEngine";

const userARequirement =
  calculatePowerRequirement(
    userAState
  );

const userBRequirement =
  calculatePowerRequirement(
    userBState
  );

export default function TestDependencyPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f1eb",
        color: "#111",
        padding: "48px 24px 80px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1240px",
          margin: "0 auto",
        }}
      >
        {/* ================================================
            HEADER
        ================================================= */}

        <section
          style={{
            marginBottom: "38px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.18em",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            ROAMLAB POWER GAP TEST
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "44px",
              lineHeight: 1.05,
              maxWidth: "900px",
            }}
          >
            Requirement.
            <br />
            Owned Capability.
            <br />
            Actual Gap.
          </h1>

          <p
            style={{
              marginTop: "20px",
              marginBottom: 0,
              maxWidth: "820px",
              fontSize: "17px",
              lineHeight: 1.65,
              color: "#555",
            }}
          >
            RoamLab now calculates what the
            trip actually requires, checks what
            the user already owns, and only
            identifies the capability that is
            still missing.
          </p>
        </section>

        {/* ================================================
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
              fontSize: "10px",
              letterSpacing: "0.16em",
              opacity: 0.55,
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

        {/* ================================================
            USER SYSTEM OVERVIEW
        ================================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          <SystemCard
            title="USER A"
            subtitle="Propane Cooking System"
            result={userATestResult}
          />

          <SystemCard
            title="USER B"
            subtitle="Electric Cooking System"
            result={userBTestResult}
          />
        </div>

        {/* ================================================
            POWER REQUIREMENT
        ================================================= */}

        <section
          style={{
            background: "#111",
            color: "#fff",
            padding: "30px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.16em",
              opacity: 0.55,
              marginBottom: "8px",
            }}
          >
            POWER REQUIREMENT ENGINE
          </div>

          <h2
            style={{
              margin: "0 0 26px",
              fontSize: "30px",
            }}
          >
            Different gear choices create
            different technical requirements.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "20px",
            }}
          >
            <RequirementCard
              title="USER A"
              subtitle="Propane + 12V Fridge"
              requirement={
                userARequirement
              }
            />

            <RequirementCard
              title="USER B"
              subtitle="Induction Cooking"
              requirement={
                userBRequirement
              }
            />
          </div>
        </section>

        {/* ================================================
            POWER GAP MATRIX
        ================================================= */}

        <section
          style={{
            background: "#fff",
            border: "1px solid #d8d5ce",
            padding: "28px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.16em",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            POWER GAP ANALYSIS
          </div>

          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "30px",
            }}
          >
            Required vs Owned vs Gap
          </h2>

          <p
            style={{
              marginTop: 0,
              marginBottom: "28px",
              color: "#666",
              lineHeight: 1.6,
            }}
          >
            A product should only be
            recommended when a real capability
            gap remains.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(420px, 1fr))",
              gap: "28px",
            }}
          >
            <GapTable
              title="USER A"
              gapResult={
                userAPowerGap
              }
            />

            <GapTable
              title="USER B"
              gapResult={
                userBPowerGap
              }
            />
          </div>
        </section>

        {/* ================================================
            MISSION STATUS
        ================================================= */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          <MissionCard
            title="USER A"
            missionCapable={
              userAPowerGap.missionCapable
            }
            needsPurchase={
              userAPowerGap.needsPurchase
            }
            needsUpgrade={
              userAPowerGap.needsUpgrade
            }
            reasons={
              userAPowerGap.reasons
            }
          />

          <MissionCard
            title="USER B"
            missionCapable={
              userBPowerGap.missionCapable
            }
            needsPurchase={
              userBPowerGap.needsPurchase
            }
            needsUpgrade={
              userBPowerGap.needsUpgrade
            }
            reasons={
              userBPowerGap.reasons
            }
          />
        </section>

        {/* ================================================
            DEPENDENCY COMPARISON
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
              fontSize: "10px",
              letterSpacing: "0.16em",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            DEPENDENCY COMPARISON
          </div>

          <h2
            style={{
              margin: "0 0 24px",
              fontSize: "27px",
            }}
          >
            Same budget does not mean the
            same power system.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "14px",
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
              label="Load Difference"
              value={`+${dependencyComparison.difference.dailyWh} Wh/day`}
            />

            <ComparisonBox
              label="Raw Peak Difference"
              value={`+${dependencyComparison.difference.peakAcLoadW} W`}
            />
          </div>
        </section>

        {/* ================================================
            COMMERCIAL PRINCIPLE
        ================================================= */}

        <section
          style={{
            background: "#111",
            color: "#fff",
            padding: "30px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.16em",
              opacity: 0.55,
              marginBottom: "10px",
            }}
          >
            ROAMLAB PRINCIPLE
          </div>

          <h2
            style={{
              margin: "0 0 18px",
              fontSize: "28px",
            }}
          >
            Do not recommend what the user
            does not need.
          </h2>

          <p
            style={{
              margin: 0,
              maxWidth: "850px",
              lineHeight: 1.7,
              color:
                "rgba(255,255,255,0.72)",
            }}
          >
            Owned gear should count toward
            mission capability. If the user
            already owns equipment that safely
            satisfies the calculated requirement,
            RoamLab should not recommend a
            duplicate product simply to create
            affiliate revenue.
          </p>
        </section>

        {/* ================================================
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
              fontSize: "10px",
              letterSpacing: "0.16em",
              fontWeight: 700,
              marginBottom: "20px",
            }}
          >
            CURRENT ENGINE FLOW
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
              "Power Requirement",
              "Owned Capability",
              "Gap Analysis",
              "Mission-Capable Filtering",
              "Cost Efficiency",
              "Budget Check",
            ].map(
              (item, index) => (
                <div
                  key={item}
                  style={{
                    background:
                      index <= 6
                        ? "#111"
                        : "#666",
                    color: "#fff",
                    minHeight: "92px",
                    padding: "16px",
                    display: "flex",
                    flexDirection:
                      "column",
                    justifyContent:
                      "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      opacity: 0.5,
                    }}
                  >
                    {String(
                      index + 1
                    ).padStart(
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
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   SYSTEM CARD
========================================================= */

function SystemCard({
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
        background: "#fff",
        border: "1px solid #d8d5ce",
        padding: "26px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.16em",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <h2
        style={{
          margin: "0 0 22px",
          fontSize: "26px",
        }}
      >
        {subtitle}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        <Metric
          label="Daily Load"
          value={`${result.powerDemand.estimatedDailyWh} Wh`}
        />

        <Metric
          label="Raw Peak"
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
          borderTop: "1px solid #ece9e2",
          paddingTop: "18px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "0.14em",
            fontWeight: 700,
            marginBottom: "10px",
          }}
        >
          SYSTEM
        </div>

        <InfoLine
          label="Cooking"
          value={
            result.system.cooking
          }
        />

        <InfoLine
          label="Food Storage"
          value={
            result.system.foodStorage
          }
        />

        <InfoLine
          label="Power"
          value={
            result.system.power
          }
        />

        <InfoLine
          label="Solar"
          value={
            result.system.solar
          }
        />
      </div>

      <div
        style={{
          borderTop: "1px solid #ece9e2",
          paddingTop: "18px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
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
                  fontSize: "13px",
                }}
              >
                <span>
                  {item.name}
                </span>

                <span
                  style={{
                    fontSize: "9px",
                    letterSpacing:
                      "0.12em",
                    fontWeight: 700,
                    textTransform:
                      "uppercase",
                    color: "#666",
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
   REQUIREMENT CARD
========================================================= */

function RequirementCard({
  title,
  subtitle,
  requirement,
}: {
  title: string;
  subtitle: string;
  requirement: ReturnType<
    typeof calculatePowerRequirement
  >;
}) {
  return (
    <div
      style={{
        background: "#1b1b1b",
        border:
          "1px solid rgba(255,255,255,0.15)",
        padding: "24px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          letterSpacing: "0.16em",
          opacity: 0.55,
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <h3
        style={{
          margin: "0 0 24px",
          fontSize: "24px",
        }}
      >
        {subtitle}
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "18px",
        }}
      >
        <DarkMetric
          label="Daily Load"
          value={`${requirement.dailyLoadWh} Wh/day`}
        />

        <DarkMetric
          label="Autonomy"
          value={`${requirement.autonomyDays} days`}
        />

        <DarkMetric
          label="Required Battery"
          value={`${requirement.requiredBatteryCapacityWh} Wh`}
        />

        <DarkMetric
          label="Required AC Output"
          value={`${requirement.requiredContinuousAcOutputW} W`}
        />

        <DarkMetric
          label="Required Surge"
          value={`${requirement.requiredSurgeOutputW} W`}
        />

        <DarkMetric
          label="Recommended Solar"
          value={`${requirement.recommendedSolarInputW} W`}
        />

        <DarkMetric
          label="AC Recharge"
          value={`${requirement.recommendedAcRechargeW} W`}
        />

        <DarkMetric
          label="Safety Reserve"
          value={`${requirement.safetyReservePercent}%`}
        />
      </div>
    </div>
  );
}

/* =========================================================
   GAP TABLE
========================================================= */

function GapTable({
  title,
  gapResult,
}: {
  title: string;
  gapResult: typeof userAPowerGap;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "14px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "24px",
          }}
        >
          {title}
        </h3>

        <StatusBadge
          status={
            gapResult.missionCapable
              ? "MISSION CAPABLE"
              : "GAP REMAINS"
          }
          positive={
            gapResult.missionCapable
          }
        />
      </div>

      <div
        style={{
          overflowX: "auto",
          border:
            "1px solid #ddd9d0",
        }}
      >
        <div
          style={{
            minWidth: "700px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1.45fr 1fr 1fr 1fr 1.15fr",
              background: "#111",
              color: "#fff",
            }}
          >
            {[
              "METRIC",
              "REQUIRED",
              "OWNED",
              "GAP",
              "STATUS",
            ].map(
              (heading) => (
                <div
                  key={heading}
                  style={{
                    padding:
                      "12px 14px",
                    fontSize:
                      "9px",
                    letterSpacing:
                      "0.12em",
                    fontWeight:
                      700,
                  }}
                >
                  {heading}
                </div>
              )
            )}
          </div>

          {gapResult.gaps.map(
            (gap) => (
              <div
                key={gap.metric}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1.45fr 1fr 1fr 1fr 1.15fr",
                  borderTop:
                    "1px solid #e7e3dc",
                  background:
                    "#fff",
                }}
              >
                <Cell strong>
                  {gap.label}
                </Cell>

                <Cell>
                  {gap.required}{" "}
                  {gap.unit}
                </Cell>

                <Cell>
                  {gap.available}{" "}
                  {gap.unit}
                </Cell>

                <Cell>
                  {gap.gap}{" "}
                  {gap.unit}
                </Cell>

                <Cell>
                  <GapStatus
                    status={
                      gap.status
                    }
                  />
                </Cell>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MISSION CARD
========================================================= */

function MissionCard({
  title,
  missionCapable,
  needsPurchase,
  needsUpgrade,
  reasons,
}: {
  title: string;
  missionCapable: boolean;
  needsPurchase: boolean;
  needsUpgrade: boolean;
  reasons: string[];
}) {
  return (
    <section
      style={{
        background:
          missionCapable
            ? "#e7e3d9"
            : "#fff",
        border:
          "1px solid #d8d5ce",
        padding: "26px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          letterSpacing: "0.16em",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <h2
        style={{
          margin: "0 0 20px",
          fontSize: "26px",
        }}
      >
        {missionCapable
          ? "Existing system is mission-capable."
          : "Power capability gap remains."}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "12px",
          marginBottom: "22px",
        }}
      >
        <MiniStatus
          label="Mission Capable"
          value={
            missionCapable
              ? "YES"
              : "NO"
          }
        />

        <MiniStatus
          label="Needs Purchase"
          value={
            needsPurchase
              ? "YES"
              : "NO"
          }
        />

        <MiniStatus
          label="Needs Upgrade"
          value={
            needsUpgrade
              ? "YES"
              : "NO"
          }
        />
      </div>

      <div
        style={{
          borderTop:
            "1px solid #d8d5ce",
          paddingTop: "16px",
          display: "grid",
          gap: "8px",
        }}
      >
        {reasons.map(
          (reason) => (
            <div
              key={reason}
              style={{
                fontSize: "13px",
                lineHeight: 1.55,
                color: "#555",
              }}
            >
              — {reason}
            </div>
          )
        )}
      </div>
    </section>
  );
}

/* =========================================================
   HELPERS
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
          fontSize: "9px",
          letterSpacing: "0.12em",
          textTransform:
            "uppercase",
          marginBottom: "5px",
          color: dark
            ? "rgba(255,255,255,0.5)"
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

function DarkMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "9px",
          letterSpacing: "0.12em",
          textTransform:
            "uppercase",
          marginBottom: "5px",
          opacity: 0.5,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "19px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        gap: "20px",
        padding: "5px 0",
        fontSize: "13px",
      }}
    >
      <span
        style={{
          color: "#777",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          textAlign: "right",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function Cell({
  children,
  strong = false,
}: {
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        padding: "14px",
        fontSize: "13px",
        fontWeight:
          strong ? 700 : 400,
        display: "flex",
        alignItems:
          "center",
      }}
    >
      {children}
    </div>
  );
}

function GapStatus({
  status,
}: {
  status:
    | "not-required"
    | "sufficient"
    | "insufficient"
    | "missing";
}) {
  let text = "";
  let background = "#dedbd3";
  let color = "#111";

  if (
    status === "sufficient"
  ) {
    text = "SUFFICIENT";
    background = "#dfe6d7";
  }

  if (
    status === "insufficient"
  ) {
    text = "INSUFFICIENT";
    background = "#ead6cf";
  }

  if (
    status === "missing"
  ) {
    text = "MISSING";
    background = "#ead6cf";
  }

  if (
    status === "not-required"
  ) {
    text = "NOT REQUIRED";
    background = "#dedbd3";
  }

  return (
    <span
      style={{
        display:
          "inline-block",
        padding:
          "7px 9px",
        background,
        color,
        fontSize:
          "9px",
        letterSpacing:
          "0.1em",
        fontWeight:
          700,
        whiteSpace:
          "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function StatusBadge({
  status,
  positive,
}: {
  status: string;
  positive: boolean;
}) {
  return (
    <span
      style={{
        padding: "8px 10px",
        fontSize: "9px",
        letterSpacing: "0.11em",
        fontWeight: 700,
        background:
          positive
            ? "#dfe6d7"
            : "#ead6cf",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function MiniStatus({
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
        padding: "14px",
      }}
    >
      <div
        style={{
          fontSize: "8px",
          letterSpacing: "0.1em",
          color: "#777",
          marginBottom: "6px",
        }}
      >
        {label.toUpperCase()}
      </div>

      <div
        style={{
          fontSize: "17px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

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
        background: "#fff",
        border:
          "1px solid #d5d0c6",
        minHeight: "102px",
        padding: "16px",
      }}
    >
      <div
        style={{
          fontSize: "9px",
          letterSpacing: "0.11em",
          color: "#777",
          textTransform:
            "uppercase",
          marginBottom: "13px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "21px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}
