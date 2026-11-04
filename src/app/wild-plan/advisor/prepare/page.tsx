
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { Wild } from "@/types/wild";
import type {
  PreparationArea,
  PreparationPlan,
  PreparationStatus,
} from "@/types/wildPreparation";

import { getCurrentWild } from "@/lib/wildStore";

import {
  getOrCreatePreparationPlan,
  refreshPreparationPlan,
  updatePreparationTaskStatus,
  getPreparationProgress,
} from "@/lib/wildPreparationStore";

const areas: {
  id: PreparationArea;
  title: string;
  description: string;
}[] = [
  {
    id: "mindset",
    title: "01 / MINDSET & EXPERIENCE",
    description: "Mental readiness and expectations",
  },
  {
    id: "physical",
    title: "02 / PHYSICAL PREPARATION",
    description: "Fitness, ability and practice",
  },
  {
    id: "supplies",
    title: "03 / SUPPLIES",
    description: "Food, water, fuel and provisions",
  },
  {
    id: "gear",
    title: "04 / GEAR SYSTEM",
    description: "Equipment and readiness",
  },
  {
    id: "logistics",
    title: "05 / ROUTE & LOGISTICS",
    description: "Access, itinerary and reservations",
  },
  {
    id: "safety",
    title: "06 / SAFETY & SKILLS",
    description: "Risk, communication and emergency plans",
  },
];

const phases: Record<string, string> = {
  early: "EARLY PLANNING",
  "weeks-before": "WEEKS BEFORE",
  "final-week": "FINAL WEEK",
  "day-before": "DAY BEFORE",
  departure: "DEPARTURE DAY",
};

const statuses: {
  value: PreparationStatus;
  label: string;
}[] = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "not-applicable", label: "Not Applicable" },
];

export default function PreparationPage() {
  const [wild, setWild] = useState<Wild | null>(null);
  const [plan, setPlan] = useState<PreparationPlan | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const current = getCurrentWild();

      setWild(current);

      if (current) {
        setPlan(getOrCreatePreparationPlan(current));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load preparation plan."
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  function changeStatus(
    taskId: string,
    status: PreparationStatus
  ) {
    if (!wild) return;

    try {
      setError("");

      const updated = updatePreparationTaskStatus(
        wild.id,
        taskId,
        status
      );

      setPlan(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save task."
      );
    }
  }

  function regenerate() {
    if (!wild) return;

    try {
      setError("");

      const current = getCurrentWild();

      if (!current || current.id !== wild.id) {
        setError("Current Wild has changed. Reload this page.");
        return;
      }

      setWild(current);
      setPlan(refreshPreparationPlan(current));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to refresh the plan."
      );
    }
  }

  const progress = plan
    ? getPreparationProgress(plan)
    : null;

  return (
    <main className="preparation-page">
      <div className="preparation-shell">
        <nav className="preparation-nav">
          <Link href="/wild-plan/advisor">
            ← WILD ADVISOR
          </Link>
          <Link href="/wild-plan">
            WILD PLAN →
          </Link>
        </nav>

        <header className="preparation-header">
          <span className="eyebrow">
            ROAMLAB / PREPARE FOR THE WILD
          </span>

          <h1>YOUR PREPARATION PLAN</h1>

          <p>
            Know what to prepare, why it matters,
            and what to do next.
          </p>
        </header>

        {!loaded && <p>Loading preparation plan...</p>}

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {loaded && !wild && (
          <section className="panel">
            <h2>No active Wild found</h2>
            <p>
              Create your Wild Plan before building
              a preparation plan.
            </p>
            <Link href="/wild-plan">
              OPEN WILD PLAN →
            </Link>
          </section>
        )}

        {wild && plan && (
          <>
            <section className="overview panel">
              <span className="eyebrow">
                CURRENT EXPEDITION
              </span>

              <h2>
                {wild.plan.adventure.destination?.name ??
                  "Destination not confirmed"}
              </h2>

              <p>
                {wild.plan.adventure.schedule?.days ??
                  "?"}{" "}
                DAYS ·{" "}
                {wild.plan.adventure.crew?.people ??
                  "?"}{" "}
                PEOPLE
              </p>

              <div className="progress-line">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progress?.percent ?? 0}%`,
                  }}
                />
              </div>

              <div className="progress-details">
                <strong>
                  {progress?.percent ?? 0}% TASKS COMPLETED
                </strong>

                <span>
                  {progress?.completed ?? 0} /{" "}
                  {progress?.total ?? 0} ACTIONABLE TASKS
                </span>
              </div>

              <button
                type="button"
                className="refresh-button"
                onClick={regenerate}
              >
                REFRESH RECOMMENDATIONS
              </button>
            </section>

            {areas.map((area) => {
              const tasks = plan.tasks.filter(
                (task) => task.area === area.id
              );

              if (tasks.length === 0) return null;

              return (
                <section
                  key={area.id}
                  className="area-section"
                >
                  <div className="area-heading">
                    <span className="eyebrow">
                      {area.title}
                    </span>

                    <p>{area.description}</p>
                  </div>

                  <div className="task-list">
                    {tasks.map((task) => (
                      <article
                        key={task.id}
                        className="task panel"
                      >
                        <div className="task-top">
                          <span className="phase">
                            {phases[task.phase] ??
                              task.phase}
                          </span>

                          <span
                            className={`priority ${task.priority}`}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                        </div>

                        <h3>{task.title}</h3>

                        <p className="reason">
                          <strong>WHY IT MATTERS</strong>
                          {task.reason}
                        </p>

                        <p className="action">
                          <strong>WHAT TO DO</strong>
                          {task.action}
                        </p>

                        {task.needsConfirmation && (
                          <p className="confirmation">
                            Information needs confirmation
                            before specific advice is possible.
                          </p>
                        )}

                        <div className="task-footer">
                          <label
                            htmlFor={`status-${task.id}`}
                          >
                            PREPARATION STATUS
                          </label>

                          <select
                            id={`status-${task.id}`}
                            value={task.status}
                            onChange={(event) =>
                              changeStatus(
                                task.id,
                                event.target
                                  .value as PreparationStatus
                              )
                            }
                          >
                            {statuses.map((status) => (
                              <option
                                key={status.value}
                                value={status.value}
                              >
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {area.id === "gear" && (
                          <Link
                            className="gear-link"
                            href="/ways-in/drive/gear"
                          >
                            OPEN GEAR ROOM →
                          </Link>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}

            <footer className="preparation-footer">
              <p>
                Task completion tracks preparation work.
                It does not certify an expedition as safe.
                Verify weather, access, permits and
                local conditions independently.
              </p>

              <Link href="/wild-plan/advisor">
                ← RETURN TO ADVISOR
              </Link>
            </footer>
          </>
        )}
      </div>

      <style jsx global>{`
        .preparation-page {
          min-height: 100vh;
          background: #101713;
          color: #f2e9d8;
          font-family: Arial, sans-serif;
          padding: 35px 24px 80px;
        }

        .preparation-shell {
          max-width: 1050px;
          margin: 0 auto;
        }

        .preparation-page a {
          color: #d6b17b;
          text-decoration: none;
        }

        .preparation-nav {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          font-size: 12px;
          letter-spacing: 1px;
        }

        .preparation-header {
          padding: 65px 0 35px;
        }

        .preparation-page .eyebrow {
          color: #c9a575;
          font-size: 11px;
          letter-spacing: 2px;
          font-weight: bold;
        }

        .preparation-page h1,
        .preparation-page h2,
        .preparation-page h3 {
          font-family: Georgia, serif;
          font-weight: normal;
        }

        .preparation-page h1 {
          font-size: clamp(35px, 5vw, 60px);
          margin: 15px 0;
        }

        .preparation-page h2 {
          font-size: 32px;
          margin: 12px 0;
        }

        .preparation-page h3 {
          font-size: 25px;
          margin: 12px 0 22px;
        }

        .preparation-page p {
          color: #c4c7bc;
          line-height: 1.7;
        }

        .preparation-page .panel {
          background: #1c251e;
          border: 1px solid #475143;
          border-radius: 7px;
          padding: 28px;
        }

        .preparation-page .overview {
          background: linear-gradient(
            120deg,
            #2c3b2e,
            #1c251e
          );
        }

        .preparation-page .progress-line {
          height: 9px;
          background: #111912;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 30px;
        }

        .preparation-page .progress-fill {
          height: 100%;
          background: #c8a16b;
          transition: width 0.2s;
        }

        .preparation-page .progress-details {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 15px;
          font-size: 12px;
          color: #d7bb91;
        }

        .preparation-page .refresh-button {
          margin-top: 28px;
          background: transparent;
          color: #d6b17b;
          border: 1px solid #8e7857;
          padding: 12px 18px;
          cursor: pointer;
          letter-spacing: 1px;
          font-size: 11px;
        }

        .preparation-page .area-section {
          margin-top: 55px;
        }

        .preparation-page .area-heading {
          margin-bottom: 20px;
        }

        .preparation-page .task-list {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(min(100%, 420px), 1fr)
          );
          gap: 18px;
        }

        .preparation-page .task-top {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .preparation-page .phase {
          color: #c6b28e;
          font-size: 11px;
          letter-spacing: 1px;
        }

        .preparation-page .priority {
          font-size: 10px;
          letter-spacing: 1px;
          color: #d4c5a7;
        }

        .preparation-page .priority.critical,
        .preparation-page .priority.important {
          color: #e2aa75;
        }

        .preparation-page .reason,
        .preparation-page .action {
          margin-top: 20px;
        }

        .preparation-page .reason strong,
        .preparation-page .action strong {
          display: block;
          color: #d7b480;
          font-size: 11px;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .preparation-page .confirmation {
          color: #e1b68c;
          font-size: 12px;
          border-left: 2px solid #c39360;
          padding-left: 12px;
        }

        .preparation-page .task-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          border-top: 1px solid #465044;
          margin-top: 25px;
          padding-top: 20px;
        }

        .preparation-page .task-footer label {
          font-size: 11px;
          color: #c7b28e;
          letter-spacing: 1px;
        }

        .preparation-page select {
          background: #101713;
          color: #f2e9d8;
          border: 1px solid #7d806c;
          border-radius: 3px;
          padding: 10px;
          cursor: pointer;
        }

        .preparation-page .gear-link {
          display: inline-block;
          margin-top: 22px;
          font-size: 12px;
          letter-spacing: 1px;
          font-weight: bold;
        }

        .preparation-page .preparation-footer {
          margin-top: 55px;
          padding-top: 25px;
          border-top: 1px solid #475143;
        }

        .preparation-page .error-message {
          background: #462d25;
          border: 1px solid #b77557;
          color: #ffe2d3;
          padding: 15px;
          margin: 20px 0;
        }

        @media (max-width: 600px) {
          .preparation-page {
            padding: 25px 16px 55px;
          }

          .preparation-page .panel {
            padding: 20px;
          }

          .preparation-header {
            padding-top: 45px;
          }
        }
      `}</style>
    </main>
  );
}
