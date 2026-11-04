
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Wild, WildPlanningIssue } from "@/types/wild";
import {
  CURRENT_WILD_UPDATED_EVENT,
  getCurrentWild,
  updateWildPlanning,
} from "@/lib/wildStore";
import { analyzeWild, mergeAdvisorIssues } from "@/lib/wildAdvisor";

const severityLabels: Record<WildPlanningIssue["severity"], string> = {
  critical: "CRITICAL",
  important: "IMPORTANT",
  attention: "TO PREPARE",
  info: "INFO",
};

const rank: Record<WildPlanningIssue["severity"], number> = {
  critical: 0,
  important: 1,
  attention: 2,
  info: 3,
};

export default function WildAdvisorPage() {
  const [wild, setWild] = useState<Wild | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  const refresh = useCallback(() => {
    setWild(getCurrentWild());
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(CURRENT_WILD_UPDATED_EVENT, refresh);

    return () =>
      window.removeEventListener(CURRENT_WILD_UPDATED_EVENT, refresh);
  }, [refresh]);

  const issues = wild
    ? analyzeWild(wild).sort(
        (a, b) => rank[a.severity] - rank[b.severity]
      )
    : [];

  const saveAnalysis = () => {
    if (!wild) return;

    const merged = mergeAdvisorIssues(
      wild.plan.planning?.issues,
      issues
    );

    updateWildPlanning({
      issues: merged,
      lastCheckedAt: new Date().toISOString(),
    });

    setSaved(true);
  };

  const destination =
    wild?.plan.adventure.destination?.name ??
    "Destination not selected";

  const days = wild?.plan.adventure.schedule?.days;
  const people = wild?.plan.adventure.crew?.people;

  return (
    <main className="advisor-page">
      <div className="advisor-shell">
        <header className="advisor-header">
          <Link href="/wild-plan" className="back-link">
            ← BACK TO WILD PLAN
          </Link>

          <span className="eyebrow">
            ROAMLAB / PLANNING INTELLIGENCE
          </span>

          <h1>YOUR WILD ADVISOR</h1>

          <p className="intro">
            A good adventure starts with a plan you can
            actually prepare for.
          </p>
        </header>

        {!loaded ? (
          <p>Loading your Wild…</p>
        ) : !wild ? (
          <section className="panel">
            <h2>No active Wild found</h2>

            <p>
              Complete the planning flow first, then return
              here for personalized advice.
            </p>

            <Link href="/wild-plan" className="action-link">
              OPEN WILD PLAN →
            </Link>
          </section>
        ) : (
          <>
            <section className="overview panel">
              <span className="eyebrow">
                YOUR CURRENT EXPEDITION
              </span>

              <h2>{destination}</h2>

              <p>
                {wild.plan.adventure.wayIn?.toUpperCase() ??
                  "WAY IN NOT SET"}

                {days
                  ? ` · ${days} DAYS`
                  : " · DURATION NOT SET"}

                {people
                  ? ` · ${people} PEOPLE`
                  : " · CREW NOT SET"}
              </p>

              <div className="overview-bottom">
                <span>
                  {issues.length} preparation recommendations
                </span>

                <button
                  type="button"
                  onClick={saveAnalysis}
                  className="save-button"
                >
                  SAVE ADVISOR FINDINGS
                </button>
              </div>

              {saved && (
                <p className="saved">
                  Findings saved to your current Wild.
                </p>
              )}
            </section>

            <div className="section-heading">
              <span className="eyebrow">
                YOUR ACTION PLAN
              </span>

              <h2>What to prepare next</h2>

              <p>
                Recommendations are based only on information
                recorded in your plan. Missing details are
                flagged for confirmation, not assumed.
              </p>
            </div>

            {issues.length === 0 ? (
              <section className="panel">
                <h3>No current rule-based findings</h3>

                <p>
                  This does not certify the trip as safe or
                  ready. Continue checking route, conditions,
                  equipment and local requirements.
                </p>
              </section>
            ) : (
              <div className="issue-list">
                {issues.map((issue, index) => (
                  <article
                    className="panel issue"
                    key={issue.id}
                  >
                    <div className="issue-top">
                      <span className="issue-number">
                        {String(index + 1).padStart(2, "0")}
                        {" / "}
                        {issue.area.toUpperCase()}
                      </span>

                      <span
                        className={`severity ${issue.severity}`}
                      >
                        {severityLabels[issue.severity]}
                      </span>
                    </div>

                    <h3>{issue.title}</h3>

                    <p>{issue.explanation}</p>

                    {issue.evidence &&
                      issue.evidence.length > 0 && (
                        <p className="evidence">
                          BASED ON:{" "}
                          {issue.evidence.join(" · ")}
                        </p>
                      )}

                    {issue.suggestions?.map(
                      (suggestion) => (
                        <div
                          className="recommendation"
                          key={suggestion.id}
                        >
                          <strong>
                            RECOMMENDED ACTION ·{" "}
                            {suggestion.title}
                          </strong>

                          <p>
                            {suggestion.description}
                          </p>
                        </div>
                      )
                    )}

                    {issue.area === "gear" && (
                      <Link
                        className="action-link"
                        href="/ways-in/drive/gear"
                      >
                        OPEN GEAR ROOM →
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            )}

            <footer className="advisor-footer">
              <p>
                Advisor V1 provides preparation prompts,
                not live weather, road, permit or
                emergency verification.
              </p>

              <Link
                href="/wild-plan"
                className="action-link"
              >
                ← RETURN TO WILD PLAN
              </Link>
            </footer>
          </>
        )}
      </div>

      <style jsx>{`
        .advisor-page {
          min-height: 100vh;
          background: #111714;
          color: #f1e9d8;
          padding: 48px 24px 80px;
          font-family: Arial, sans-serif;
        }

        .advisor-shell {
          max-width: 1000px;
          margin: 0 auto;
        }

        .advisor-header {
          padding-bottom: 36px;
        }

        .back-link {
          display: inline-block;
          color: #d9b57b;
          font-size: 12px;
          letter-spacing: 1.5px;
          text-decoration: none;
          margin-bottom: 45px;
        }

        .eyebrow {
          color: #c8a572;
          font-size: 11px;
          letter-spacing: 2px;
          font-weight: 700;
        }

        h1 {
          font-family: Georgia, serif;
          font-size: clamp(35px, 6vw, 66px);
          font-weight: 400;
          margin: 15px 0;
          letter-spacing: 1px;
        }

        h2, h3 {
          font-family: Georgia, serif;
          font-weight: 400;
        }

        h2 {
          font-size: clamp(25px, 4vw, 38px);
          margin: 12px 0;
        }

        h3 {
          font-size: 25px;
          margin: 14px 0;
        }

        p {
          color: #c7c9be;
          line-height: 1.7;
        }

        .intro {
          font-size: 17px;
        }

        .panel {
          background: #1b231d;
          border: 1px solid #48503e;
          border-radius: 7px;
          padding: 28px;
        }

        .overview {
          background: linear-gradient(
            125deg,
            #29372b,
            #1b231d
          );
        }

        .overview-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 22px;
          color: #d9b57b;
        }

        .save-button {
          cursor: pointer;
          background: #c7a16c;
          color: #172019;
          border: 0;
          border-radius: 3px;
          padding: 13px 18px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .saved {
          color: #b6d9a2;
          font-size: 13px;
        }

        .section-heading {
          margin: 48px 0 24px;
        }

        .issue-list {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(min(100%, 410px), 1fr)
          );
          gap: 18px;
        }

        .issue-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .issue-number {
          color: #b4aa91;
          font-size: 11px;
          letter-spacing: 1px;
        }

        .severity {
          font-size: 10px;
          letter-spacing: 1px;
          border: 1px solid #7a806d;
          padding: 7px 9px;
          border-radius: 3px;
          white-space: nowrap;
        }

        .severity.important,
        .severity.critical {
          color: #e8b27f;
          border-color: #b47d4b;
        }

        .recommendation {
          border-top: 1px solid #424a3f;
          margin-top: 20px;
          padding-top: 18px;
        }

        .recommendation strong {
          color: #d7b37d;
          font-size: 12px;
          line-height: 1.7;
        }

        .recommendation p {
          margin-bottom: 0;
        }

        .evidence {
          color: #b2a88d;
          font-size: 12px;
        }

        .action-link {
          display: inline-block;
          color: #d9b57b;
          font-size: 12px;
          letter-spacing: 1px;
          font-weight: 700;
          text-decoration: none;
          margin-top: 18px;
        }

        .advisor-footer {
          margin-top: 34px;
          padding-top: 22px;
          border-top: 1px solid #48503e;
        }

        @media (max-width: 600px) {
          .advisor-page {
            padding: 25px 16px 55px;
          }

          .panel {
            padding: 20px;
          }

          .back-link {
            margin-bottom: 28px;
          }
        }
      `}</style>
    </main>
  );
}
