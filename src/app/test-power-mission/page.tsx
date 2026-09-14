import { userBState } from "@/data/testGearDependency";

import { calculatePowerRequirement } from "@/data/powerRequirementEngine";

import { powerProducts } from "@/data/products/powerProducts";

import {
  filterPowerMissionCandidates,
  getClosestRejectedPowerCandidates,
  getPowerMissionFailureCounts,
  type PowerMissionCandidateResult,
} from "@/data/powerMissionFilter";


/* =========================================================
   TEST DATA
   ========================================================= */

const requirement =
  calculatePowerRequirement(userBState);

const result =
  filterPowerMissionCandidates(
    requirement,
    powerProducts
  );

const closest =
  getClosestRejectedPowerCandidates(
    result,
    3
  );

const failureCounts =
  getPowerMissionFailureCounts(
    result
  );


/* =========================================================
   PAGE
   ========================================================= */

export default function TestPowerMissionPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "#f4f1e8",
        padding: "48px 24px 80px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <header
          style={{
            marginBottom: 42,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              opacity: 0.55,
              marginBottom: 12,
            }}
          >
            ROAMLAB HARD REQUIREMENT GATE
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 42,
              lineHeight: 1.05,
            }}
          >
            Power Mission Filter Test
          </h1>

          <p
            style={{
              marginTop: 16,
              color: "#aaa69c",
              maxWidth: 760,
              lineHeight: 1.6,
            }}
          >
            User B keeps the induction cooking system.
            Every Power Station must satisfy all hard
            technical requirements before it may enter
            ranking.
          </p>
        </header>


        {/* USER PROFILE */}

        <section
          style={{
            background: "#181818",
            border: "1px solid #303030",
            borderRadius: 14,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <Label>
            USER B — ADVENTURE PROFILE
          </Label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 14,
              marginTop: 18,
            }}
          >
            <Metric
              label="Vehicle"
              value="Crossover"
            />

            <Metric
              label="Trip"
              value="Remote"
            />

            <Metric
              label="Crew"
              value="Friends"
            />

            <Metric
              label="People"
              value="5"
            />

            <Metric
              label="Duration"
              value="Multi-day"
            />

            <Metric
              label="Cooking"
              value="Induction"
            />
          </div>
        </section>


        {/* REQUIREMENT */}

        <section
          style={{
            background: "#181818",
            border: "1px solid #303030",
            borderRadius: 14,
            padding: 24,
            marginBottom: 28,
          }}
        >
          <Label>
            HARD POWER REQUIREMENTS
          </Label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 14,
              marginTop: 18,
            }}
          >
            <Metric
              label="Battery"
              value={`${requirement.requiredBatteryCapacityWh} Wh`}
            />

            <Metric
              label="Continuous AC"
              value={`${requirement.requiredContinuousAcOutputW} W`}
            />

            <Metric
              label="Surge"
              value={`${requirement.requiredSurgeOutputW} W`}
            />

            <Metric
              label="Solar"
              value={`${requirement.recommendedSolarInputW} W`}
            />

            <Metric
              label="AC Recharge"
              value={`${requirement.recommendedAcRechargeW} W`}
            />
          </div>
        </section>


        {/* FILTER SUMMARY */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <SummaryCard
            label="Evaluated"
            value={String(
              result.evaluatedCount
            )}
          />

          <SummaryCard
            label="Mission Capable"
            value={String(
              result.missionCapableCount
            )}
          />

          <SummaryCard
            label="Rejected"
            value={String(
              result.rejectedCount
            )}
          />

          <SummaryCard
            label="Can Rank?"
            value={
              result.hasMissionCapableCandidate
                ? "YES"
                : "NO"
            }
          />
        </section>


        {/* VERDICT */}

        <section
          style={{
            border: "1px solid #3a302c",
            background: "#1b1715",
            borderRadius: 14,
            padding: 26,
            marginBottom: 34,
          }}
        >
          <Label>
            FILTER VERDICT
          </Label>

          <div
            style={{
              marginTop: 12,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {result.missionCapableCount === 0
              ? "0 MISSION-CAPABLE CANDIDATES"
              : `${result.missionCapableCount} MISSION-CAPABLE CANDIDATE(S)`}
          </div>

          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              maxWidth: 900,
              lineHeight: 1.6,
              color: "#c7c0b4",
            }}
          >
            {result.summary}
          </p>

          {result.missionCapableCount === 0 && (
            <div
              style={{
                marginTop: 20,
                padding: 18,
                background: "#111",
                border: "1px solid #342d29",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  opacity: 0.55,
                }}
              >
                ROAMLAB DECISION
              </div>

              <div
                style={{
                  marginTop: 9,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                DO NOT RECOMMEND FROM CURRENT POOL
              </div>

              <div
                style={{
                  marginTop: 8,
                  color: "#aaa69c",
                  lineHeight: 1.55,
                }}
              >
                No current candidate has passed every
                hard mission requirement. Product ranking
                must stop here.
              </div>
            </div>
          )}
        </section>


        {/* ALL CANDIDATES */}

        <section>
          <Label>
            ALL CANDIDATES
          </Label>

          <div
            style={{
              display: "grid",
              gap: 18,
              marginTop: 18,
            }}
          >
            {result.allResults.map(
              (candidate) => (
                <CandidateCard
                  key={candidate.product.id}
                  candidate={candidate}
                />
              )
            )}
          </div>
        </section>


        {/* FAILURE COUNTS */}

        <section
          style={{
            marginTop: 42,
            paddingTop: 30,
            borderTop: "1px solid #2d2d2d",
          }}
        >
          <Label>
            HARD-GATE FAILURE COUNTS
          </Label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 14,
              marginTop: 18,
            }}
          >
            <Metric
              label="Battery Failures"
              value={String(
                failureCounts.batteryCapacityWh
              )}
            />

            <Metric
              label="AC Output Failures"
              value={String(
                failureCounts.continuousAcOutputW
              )}
            />

            <Metric
              label="Surge Failures"
              value={String(
                failureCounts.surgeOutputW
              )}
            />

            <Metric
              label="Solar Failures"
              value={String(
                failureCounts.solarInputW
              )}
            />

            <Metric
              label="Recharge Failures"
              value={String(
                failureCounts.acRechargeW
              )}
            />
          </div>
        </section>


        {/* CLOSEST REJECTED */}

        <section
          style={{
            marginTop: 42,
          }}
        >
          <Label>
            CLOSEST REJECTED CANDIDATES
          </Label>

          <p
            style={{
              color: "#969187",
              lineHeight: 1.6,
              maxWidth: 820,
              marginTop: 12,
            }}
          >
            These products are shown for diagnosis only.
            They are not recommendations because they
            failed at least one hard mission requirement.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
              marginTop: 18,
            }}
          >
            {closest.map(
              (candidate) => (
                <div
                  key={candidate.product.id}
                  style={{
                    background: "#181818",
                    border: "1px solid #303030",
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {candidate.product.name}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: "#817d75",
                    }}
                  >
                    {candidate.product.brand}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      color: "#aaa69c",
                    }}
                  >
                    Failed hard gates:{" "}
                    {candidate.failedChecks.length}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    {candidate.failedChecks.map(
                      (check) => (
                        <div
                          key={check.metric}
                          style={{
                            fontSize: 13,
                            color: "#bca99e",
                          }}
                        >
                          → {check.label}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </section>


        {/* ENGINE FLOW */}

        <section
          style={{
            marginTop: 46,
            padding: 28,
            background: "#181818",
            border: "1px solid #303030",
            borderRadius: 14,
          }}
        >
          <Label>
            ROAMLAB PRODUCT DECISION FLOW
          </Label>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gap: 10,
              color: "#c7c0b4",
              fontSize: 16,
              lineHeight: 1.55,
            }}
          >
            <div>
              Power Requirement
            </div>

            <div>↓</div>

            <div>
              Hard Requirement Gate
            </div>

            <div>↓</div>

            <div>
              Mission-Capable Candidates
            </div>

            <div>↓</div>

            <div>
              Reliability / Safety / Evidence
            </div>

            <div>↓</div>

            <div>
              Cost Efficiency
            </div>

            <div>↓</div>

            <div>
              Final Recommendation
            </div>
          </div>
        </section>


        {/* PRINCIPLE */}

        <section
          style={{
            marginTop: 24,
            padding: 28,
            background: "#181818",
            border: "1px solid #303030",
            borderRadius: 14,
          }}
        >
          <Label>
            ROAMLAB RULE
          </Label>

          <div
            style={{
              marginTop: 14,
              fontSize: 26,
              fontWeight: 700,
              lineHeight: 1.35,
            }}
          >
            If zero products pass the hard gate,
            RoamLab recommends zero products.
          </div>

          <p
            style={{
              marginTop: 14,
              color: "#aaa69c",
              maxWidth: 860,
              lineHeight: 1.6,
              marginBottom: 0,
            }}
          >
            RoamLab should expand the product pool,
            move to a higher-capacity class, evaluate
            a compatible expandable system, or allow
            the user to reconsider the gear
            configuration.
          </p>
        </section>
      </div>
    </main>
  );
}


/* =========================================================
   CANDIDATE CARD
   ========================================================= */

function CandidateCard({
  candidate,
}: {
  candidate: PowerMissionCandidateResult;
}) {
  return (
    <article
      style={{
        background: "#181818",
        border: "1px solid #303030",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: 22,
          borderBottom: "1px solid #2d2d2d",
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {candidate.product.name}
          </div>

          <div
            style={{
              marginTop: 6,
              color: "#918c83",
              fontSize: 13,
            }}
          >
            {candidate.product.brand}
            {" • $"}
            {candidate.product.price}
          </div>
        </div>

        <Status
          passed={candidate.missionCapable}
        />
      </div>


      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
        }}
      >
        {candidate.checks.map(
          (check) => (
            <div
              key={check.metric}
              style={{
                padding: 18,
                borderRight: "1px solid #292929",
                borderBottom: "1px solid #292929",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  opacity: 0.5,
                }}
              >
                {check.label}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {check.passed
                  ? "PASS"
                  : check.known
                    ? "FAIL"
                    : "UNKNOWN"}
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "#969187",
                  lineHeight: 1.45,
                }}
              >
                Required: {check.required} {check.unit}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#969187",
                  lineHeight: 1.45,
                }}
              >
                Available:{" "}
                {check.available === null
                  ? "Unknown"
                  : `${check.available} ${check.unit}`}
              </div>

              {!check.passed && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    color: "#bca99e",
                    lineHeight: 1.45,
                  }}
                >
                  {check.reason}
                </div>
              )}
            </div>
          )
        )}
      </div>


      {candidate.failureReasons.length > 0 && (
        <div
          style={{
            padding: 20,
            borderTop: "1px solid #292929",
          }}
        >
          <Label>
            REJECTION REASONS
          </Label>

          <div
            style={{
              display: "grid",
              gap: 8,
              marginTop: 12,
              color: "#aaa69c",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {candidate.failureReasons.map(
              (reason, index) => (
                <div
                  key={`${candidate.product.id}-${index}`}
                >
                  → {reason}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </article>
  );
}


/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

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
        background: "#111",
        border: "1px solid #303030",
        borderRadius: 10,
        padding: 16,
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
          fontSize: 17,
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}


function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#181818",
        border: "1px solid #303030",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 10,
          opacity: 0.45,
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}


function Status({
  passed,
}: {
  passed: boolean;
}) {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        border: "1px solid #3a3a3a",
        background: passed
          ? "#1d261d"
          : "#291d1a",
        whiteSpace: "nowrap",
      }}
    >
      {passed
        ? "MISSION CAPABLE"
        : "REJECTED"}
    </div>
  );
}
