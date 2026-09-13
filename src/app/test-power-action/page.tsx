import {
  userAState,
  userBState,
} from "@/data/testGearDependency";

import {
  determinePowerAction,
  getPowerActionLabel,
  type PowerActionResult,
} from "@/data/powerActionEngine";


const userAAction =
  determinePowerAction(userAState);

const userBAction =
  determinePowerAction(userBState);


export default function TestPowerActionPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "#f3f0e8",
        padding: "48px 24px 80px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <header
          style={{
            marginBottom: 48,
          }}
        >
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.22em",
              opacity: 0.65,
              marginBottom: 12,
            }}
          >
            ROAMLAB SYSTEM ENGINE
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 42,
              lineHeight: 1.05,
              fontWeight: 700,
            }}
          >
            Power Action Engine Test
          </h1>

          <p
            style={{
              marginTop: 16,
              maxWidth: 760,
              color: "#b9b5aa",
              lineHeight: 1.6,
              fontSize: 16,
            }}
          >
            Requirement → Owned Capability →
            Gap → Action Decision
          </p>
        </header>


        {/* SHARED PROFILE */}

        <section
          style={{
            border: "1px solid #2d2d2d",
            borderRadius: 14,
            padding: 24,
            marginBottom: 36,
            background: "#171717",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              opacity: 0.55,
              marginBottom: 14,
            }}
          >
            SHARED ADVENTURE PROFILE
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 16,
            }}
          >
            <ProfileItem
              label="Vehicle"
              value="Crossover"
            />

            <ProfileItem
              label="Trip"
              value="Remote"
            />

            <ProfileItem
              label="Crew"
              value="Friends"
            />

            <ProfileItem
              label="People"
              value="5"
            />

            <ProfileItem
              label="Duration"
              value="Multi-day"
            />

            <ProfileItem
              label="Budget"
              value="$3,000"
            />
          </div>
        </section>


        {/* TWO USERS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(420px, 1fr))",
            gap: 28,
          }}
        >
          <ActionCard
            title="USER A"
            subtitle="Existing system should already be sufficient"
            result={userAAction}
          />

          <ActionCard
            title="USER B"
            subtitle="High-power induction cooking creates a larger requirement"
            result={userBAction}
          />
        </div>


        {/* EXPECTATION */}

        <section
          style={{
            marginTop: 48,
            borderTop:
              "1px solid #2b2b2b",
            paddingTop: 34,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              opacity: 0.55,
              marginBottom: 18,
            }}
          >
            EXPECTED ENGINE BEHAVIOR
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 18,
            }}
          >
            <ExpectationCard
              title="USER A"
              lines={[
                "KEEP CURRENT SYSTEM",
                "Purchase Required: NO",
                "Product Filtering: NO",
                "No duplicate Power Station recommendation",
              ]}
            />

            <ExpectationCard
              title="USER B"
              lines={[
                "Try RECONFIGURE first",
                "Induction Cooker → Propane Stove",
                "Recalculate requirement",
                "Only recommend new Power hardware if still necessary",
              ]}
            />
          </div>
        </section>


        {/* ENGINE PRINCIPLE */}

        <section
          style={{
            marginTop: 48,
            padding: 28,
            borderRadius: 14,
            background: "#1a1a1a",
            border: "1px solid #303030",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              opacity: 0.55,
              marginBottom: 14,
            }}
          >
            ROAMLAB DECISION PRINCIPLE
          </div>

          <div
            style={{
              fontSize: 25,
              lineHeight: 1.35,
              maxWidth: 900,
            }}
          >
            Do not ask
            {" "}
            <strong>
              “What should the user buy?”
            </strong>
            {" "}
            first.
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 25,
              lineHeight: 1.35,
              maxWidth: 900,
              color: "#d7d1c3",
            }}
          >
            First ask:
            {" "}
            <strong>
              “What is the lowest-cost,
              mission-capable system?”
            </strong>
          </div>
        </section>
      </div>
    </main>
  );
}


/* =========================================================
   ACTION CARD
   ========================================================= */

function ActionCard({
  title,
  subtitle,
  result,
}: {
  title: string;
  subtitle: string;
  result: PowerActionResult;
}) {
  const gap =
    result.currentGap;

  const best =
    result.bestReconfiguration;

  return (
    <section
      style={{
        border: "1px solid #303030",
        borderRadius: 16,
        overflow: "hidden",
        background: "#171717",
      }}
    >
      {/* CARD HEADER */}

      <div
        style={{
          padding: 24,
          borderBottom:
            "1px solid #2b2b2b",
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.18em",
            opacity: 0.55,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 15,
            color: "#aaa69b",
            marginTop: 8,
          }}
        >
          {subtitle}
        </div>
      </div>


      {/* ACTION */}

      <div
        style={{
          padding: 24,
          borderBottom:
            "1px solid #2b2b2b",
        }}
      >
        <Label>
          ACTION DECISION
        </Label>

        <div
          style={{
            marginTop: 12,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          {getPowerActionLabel(
            result.action
          )}
        </div>

        <div
          style={{
            marginTop: 12,
            color: "#c1bbae",
            lineHeight: 1.55,
          }}
        >
          {result.summary}
        </div>
      </div>


      {/* DECISION FLAGS */}

      <div
        style={{
          padding: 24,
          borderBottom:
            "1px solid #2b2b2b",
        }}
      >
        <Label>
          DECISION FLAGS
        </Label>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, 1fr)",
            gap: 12,
            marginTop: 16,
          }}
        >
          <Flag
            label="Mission Capable Now"
            value={
              gap.missionCapable
                ? "YES"
                : "NO"
            }
          />

          <Flag
            label="Purchase Required"
            value={
              result.purchaseRequired
                ? "YES"
                : "NO"
            }
          />

          <Flag
            label="Product Filtering"
            value={
              result.productFilteringRequired
                ? "YES"
                : "NO"
            }
          />

          <Flag
            label="Confidence"
            value={
              result.confidence.toUpperCase()
            }
          />
        </div>
      </div>


      {/* CURRENT GAP */}

      <div
        style={{
          padding: 24,
          borderBottom:
            "1px solid #2b2b2b",
        }}
      >
        <Label>
          CURRENT POWER GAP
        </Label>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns:
              "repeat(2, 1fr)",
            gap: 12,
          }}
        >
          <Metric
            label="Battery Required"
            value={`${gap.summary.requiredBatteryCapacityWh} Wh`}
          />

          <Metric
            label="Battery Owned"
            value={`${gap.summary.availableBatteryCapacityWh} Wh`}
          />

          <Metric
            label="Battery Gap"
            value={`${gap.summary.batteryGapWh} Wh`}
          />

          <Metric
            label="AC Output Gap"
            value={`${gap.summary.acOutputGapW} W`}
          />
        </div>
      </div>


      {/* RECONFIGURATION */}

      <div
        style={{
          padding: 24,
          borderBottom:
            "1px solid #2b2b2b",
        }}
      >
        <Label>
          BEST RECONFIGURATION
        </Label>

        {!best ? (
          <div
            style={{
              marginTop: 14,
              color: "#858177",
            }}
          >
            No reconfiguration option
            detected.
          </div>
        ) : (
          <div
            style={{
              marginTop: 16,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {best.sourceItemName}
              {" → "}
              {best.alternativeName}
            </div>

            <div
              style={{
                marginTop: 12,
                lineHeight: 1.55,
                color: "#aaa69b",
              }}
            >
              {best.description}
            </div>

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              <Metric
                label="Battery Reduction"
                value={`${best.batteryReductionWh} Wh`}
              />

              <Metric
                label="AC Reduction"
                value={`${best.acOutputReductionW} W`}
              />

              <Metric
                label="Solar Reduction"
                value={`${best.solarReductionW} W`}
              />

              <Metric
                label="Mission Capable After Change"
                value={
                  best.becomesMissionCapableWithOwnedGear
                    ? "YES"
                    : "NO"
                }
              />
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                opacity: 0.65,
              }}
            >
              Reconfiguration Score:
              {" "}
              {best.score}
            </div>
          </div>
        )}
      </div>


      {/* REASONS */}

      <div
        style={{
          padding: 24,
        }}
      >
        <Label>
          ENGINE REASONS
        </Label>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gap: 10,
          }}
        >
          {result.reasons.map(
            (reason, index) => (
              <div
                key={`${title}-${index}`}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "24px 1fr",
                  gap: 10,
                  lineHeight: 1.5,
                  color: "#bdb8ac",
                }}
              >
                <span
                  style={{
                    opacity: 0.45,
                  }}
                >
                  {index + 1}.
                </span>

                <span>
                  {reason}
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
   SMALL COMPONENTS
   ========================================================= */

function ProfileItem({
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
          fontSize: 11,
          opacity: 0.5,
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 17,
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}


function Label({
  children,
}: {
  children: string;
}) {
  return (
    <div
      style={{
        fontSize: 10,
        letterSpacing: "0.18em",
        opacity: 0.5,
      }}
    >
      {children}
    </div>
  );
}


function Flag({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#111",
        padding: 14,
        borderRadius: 10,
        border: "1px solid #292929",
      }}
    >
      <div
        style={{
          fontSize: 10,
          opacity: 0.45,
          marginBottom: 7,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}


function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        background: "#111",
        border: "1px solid #292929",
      }}
    >
      <div
        style={{
          fontSize: 10,
          opacity: 0.45,
          marginBottom: 7,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}


function ExpectationCard({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div
      style={{
        padding: 22,
        background: "#171717",
        border:
          "1px solid #2d2d2d",
        borderRadius: 12,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          marginBottom: 14,
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "grid",
          gap: 8,
          color: "#aaa69b",
          fontSize: 14,
        }}
      >
        {lines.map(
          (line, index) => (
            <div
              key={`${title}-${index}`}
            >
              → {line}
            </div>
          )
        )}
      </div>
    </div>
  );
}
