"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentWild,
  updateWildBudget,
} from "@/lib/wildStore";

import type { WildWayIn } from "@/types/wild";

const BUDGET_PRESETS = [500, 1000, 2000, 3000, 5000];

function getNextRoute(wayIn?: WildWayIn): string {
  switch (wayIn) {
    case "drive":
      return "/ways-in/drive";

    case "hike":
    case "walk":
      return "/ways-in/hike";

    case "ride":
    case "bike":
      return "/ways-in/ride";

    case "paddle":
    case "kayak":
      return "/ways-in/paddle";

    default:
      return "/ways-in";
  }
}

function getWayInLabel(wayIn?: WildWayIn): string {
  switch (wayIn) {
    case "drive":
      return "DRIVE";

    case "hike":
    case "walk":
      return "HIKE";

    case "ride":
    case "bike":
      return "RIDE";

    case "paddle":
    case "kayak":
      return "PADDLE";

    default:
      return "WILD";
  }
}

export default function WildBudgetPage() {
  const router = useRouter();

  const [wayIn, setWayIn] = useState<WildWayIn>();
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const wild = getCurrentWild();

    if (!wild) {
      router.replace("/ways-in");
      return;
    }

    const selectedWayIn = wild.plan.adventure.wayIn;
    setWayIn(selectedWayIn);

    const existingBudget = wild.plan.cost?.totalWildBudget;
    const budgetStatus = wild.plan.cost?.budgetStatus;

    if (
      budgetStatus === "set" &&
      typeof existingBudget === "number"
    ) {
      setBudget(String(existingBudget));
    }
  }, [router]);

  function choosePreset(amount: number) {
    setBudget(String(amount));
    setError("");
  }

  function handleBudgetChange(value: string) {
    const cleaned = value.replace(/[^\d]/g, "");

    setBudget(cleaned);
    setError("");
  }

  function continueWithBudget() {
    const amount = Number(budget);

    if (
      !budget ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError(
        "Enter your budget or choose I DON’T KNOW YET."
      );
      return;
    }

    updateWildBudget({
      status: "set",
      totalWildBudget: amount,
      currency: "USD",
    });

    router.push(getNextRoute(wayIn));
  }

  function continueWithoutBudget() {
    updateWildBudget({
      status: "unknown",
      currency: "USD",
    });

    router.push(getNextRoute(wayIn));
  }

  const formattedBudget = budget
    ? Number(budget).toLocaleString("en-US")
    : "";

  return (
    <main className="budget-page">
      {/* BACKGROUND */}
      <img
        src="/wild-budget.jpg"
        alt=""
        className="budget-bg"
        draggable={false}
      />

      <div
        className="scene-overlay"
        aria-hidden="true"
      />

      {/* NAVIGATION */}
      <nav className="budget-nav">
        <Link
          href="/"
          className="budget-brand"
        >
          ROAMLAB
        </Link>

        <div className="budget-nav-links">
          <Link href="/explore">
            EXPLORE
          </Link>

          <Link href="/wild-plan">
            PLAN
          </Link>

          <Link href="/prepare">
            PREPARE
          </Link>

          <Link href="/safety">
            SAFETY
          </Link>

          <Link href="/learn">
            LEARN
          </Link>

          <Link href="/journal">
            JOURNAL
          </Link>

          <Link href="/stories">
            STORIES
          </Link>

          <Link href="/badges">
            BADGES
          </Link>
        </div>

        <Link
          href="/signin"
          className="budget-signin"
        >
          SIGN IN
        </Link>

        <Link
          href="/ways-in"
          className="budget-start"
        >
          START YOUR WILD
          <span>→</span>
        </Link>
      </nav>

      {/* BUDGET INTERACTION AREA */}
      <section className="budget-panel">
        {/* CONTEXT */}
        <div className="budget-context">
          <span className="context-line" />

          <span>
            {getWayInLabel(wayIn)}
          </span>

          <span className="context-dot">
            •
          </span>

          <span>
            WILD BUDGET
          </span>
        </div>

        {/* TITLE */}
        <div className="budget-heading">
          <p className="heading-label">
            PLAN WITHIN YOUR LIMITS
          </p>

          <h1>
            TOTAL WILD
            <br />
            BUDGET
          </h1>

          <p className="budget-question">
            How much are you comfortable spending
            on this entire Wild?
          </p>
        </div>

        {/* MONEY INPUT */}
        <div className="money-block">
          <div className="amount-field">
            <span className="currency">
              $
            </span>

            <input
              type="text"
              inputMode="numeric"
              value={formattedBudget}
              onChange={(event) =>
                handleBudgetChange(
                  event.target.value
                )
              }
              placeholder="2,000"
              aria-label="Total Wild Budget"
            />

            <span className="currency-code">
              USD
            </span>
          </div>

          {/* PRESETS */}
          <div className="budget-presets">
            {BUDGET_PRESETS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() =>
                  choosePreset(amount)
                }
                className={
                  Number(budget) === amount
                    ? "preset active"
                    : "preset"
                }
              >
                $
                {amount.toLocaleString(
                  "en-US"
                )}
              </button>
            ))}
          </div>
        </div>

        {/* COST SCOPE */}
        <div className="budget-scope">
          <span className="scope-label">
            INCLUDES
          </span>

          <p>
            TRAVEL
            <span>•</span>
            CAMPSITES
            <span>•</span>
            FOOD
            <span>•</span>
            PERMITS
            <span>•</span>
            ACTIVITIES
            <span>•</span>
            GEAR GAPS
          </p>
        </div>

        {error && (
          <p
            className="budget-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* ACTIONS */}
        <div className="budget-actions">
          <button
            type="button"
            className="continue-button"
            onClick={continueWithBudget}
          >
            <span>
              CONTINUE
            </span>

            <span className="continue-arrow">
              →
            </span>
          </button>

          <button
            type="button"
            className="unknown-button"
            onClick={
              continueWithoutBudget
            }
          >
            I DON&apos;T KNOW YET
          </button>
        </div>

        {/* NOTE */}
        <div className="budget-note">
          <span className="note-number">
            01
          </span>

          <p>
            Gear you already own does not count
            as new spending.
          </p>
        </div>

        <Link
          href="/ways-in"
          className="change-way"
        >
          <span>←</span>
          CHANGE WAY IN
        </Link>
      </section>

      <style jsx>{`
        /* =====================================================
           PAGE
           ===================================================== */

        .budget-page {
          position: relative;

          width: 100%;
          height: 100vh;
          min-height: 720px;

          overflow: hidden;

          background: #080705;

          color: #d7c7a7;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .budget-page *,
        .budget-page *::before,
        .budget-page *::after {
          box-sizing: border-box;
        }

        /* =====================================================
           BACKGROUND
           ===================================================== */

        .budget-bg {
          position: absolute;
          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;
          object-position: center center;

          user-select: none;
          pointer-events: none;
        }

        .scene-overlay {
          position: absolute;
          inset: 0;

          z-index: 1;

          pointer-events: none;

          background:
            linear-gradient(
              180deg,
              rgba(5, 4, 3, 0.48) 0%,
              rgba(5, 4, 3, 0.06) 15%,
              rgba(5, 4, 3, 0) 43%,
              rgba(5, 4, 3, 0.08) 78%,
              rgba(5, 4, 3, 0.32) 100%
            ),
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0) 50%,
              rgba(6, 4, 2, 0.04) 63%,
              rgba(6, 4, 2, 0.17) 100%
            );
        }

        /* =====================================================
           NAVIGATION
           ===================================================== */

        .budget-nav {
          position: absolute;

          z-index: 30;

          top: 0;
          left: 0;
          right: 0;

          height: 68px;

          padding:
            0 32px;

          display: flex;
          align-items: center;

          background:
            linear-gradient(
              180deg,
              rgba(4, 4, 3, 0.78) 0%,
              rgba(4, 4, 3, 0.32) 55%,
              transparent 100%
            );
        }

        .budget-nav a,
        .budget-nav a:link,
        .budget-nav a:visited,
        .budget-nav a:active {
          text-decoration: none;
        }

        .budget-brand,
        .budget-brand:link,
        .budget-brand:visited {
          flex-shrink: 0;

          margin-right: 45px;

          color: #d8c9aa !important;

          font-size: 17px;
          font-weight: 700;

          letter-spacing: 0.15em;

          transition:
            color 160ms ease;
        }

        .budget-brand:hover {
          color: #e4d8bf !important;
        }

        .budget-nav-links {
          display: flex;
          align-items: center;

          gap: 25px;
        }

        .budget-nav-links a,
        .budget-nav-links a:link,
        .budget-nav-links a:visited {
          color:
            rgba(
              211,
              199,
              173,
              0.64
            ) !important;

          font-size: 9px;
          font-weight: 600;

          letter-spacing: 0.14em;

          transition:
            color 160ms ease;
        }

        .budget-nav-links a:hover {
          color: #c7a666 !important;
        }

        .budget-signin,
        .budget-signin:link,
        .budget-signin:visited {
          margin-left: auto;

          color:
            rgba(
              211,
              199,
              173,
              0.62
            ) !important;

          font-size: 9px;
          font-weight: 600;

          letter-spacing: 0.14em;

          transition:
            color 160ms ease;
        }

        .budget-signin:hover {
          color: #c7a666 !important;
        }

        .budget-start,
        .budget-start:link,
        .budget-start:visited {
          height: 34px;

          margin-left: 25px;

          padding:
            0 14px;

          display: flex;
          align-items: center;

          gap: 12px;

          border:
            1px solid
            rgba(
              188,
              151,
              85,
              0.43
            );

          background:
            rgba(
              23,
              16,
              10,
              0.24
            );

          color: #c7a666 !important;

          font-size: 8px;
          font-weight: 700;

          letter-spacing: 0.13em;

          transition:
            background 160ms ease,
            border-color 160ms ease,
            color 160ms ease;
        }

        .budget-start:hover {
          border-color:
            rgba(
              205,
              169,
              101,
              0.7
            );

          background:
            rgba(
              83,
              56,
              27,
              0.28
            );

          color: #ddc184 !important;
        }

        /* =====================================================
           BUDGET PANEL

           Designed around the leather pad in wild-budget.jpg
           ===================================================== */

        .budget-panel {
          position: absolute;

          z-index: 10;

          left: 66.7%;
          top: 51.5%;

          width:
            min(
              390px,
              29.5vw
            );

          transform:
            translateY(-50%);

          color: #d0bf9e;

          text-align: left;

          text-shadow:
            0 2px 12px
            rgba(0, 0, 0, 0.65);
        }

        /* =====================================================
           CONTEXT
           ===================================================== */

        .budget-context {
          height: 15px;

          display: flex;
          align-items: center;

          gap: 9px;

          margin-bottom: 15px;

          color: #b89558;

          font-size: 7px;
          font-weight: 700;

          letter-spacing: 0.2em;
        }

        .context-line {
          width: 25px;
          height: 1px;

          background:
            rgba(
              184,
              149,
              88,
              0.55
            );
        }

        .context-dot {
          color:
            rgba(
              184,
              149,
              88,
              0.42
            );
        }

        /* =====================================================
           HEADING
           ===================================================== */

        .heading-label {
          margin:
            0 0 8px;

          color:
            rgba(
              186,
              157,
              104,
              0.58
            );

          font-size: 6px;
          font-weight: 700;

          letter-spacing: 0.22em;
        }

        .budget-heading h1 {
          margin: 0;

          color: #d4c3a2;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            clamp(
              30px,
              2.65vw,
              43px
            );

          line-height: 0.92;

          font-weight: 600;

          letter-spacing: 0.025em;

          text-transform: uppercase;

          text-shadow:
            0 3px 16px
            rgba(0, 0, 0, 0.68);
        }

        .budget-question {
          max-width: 340px;

          margin:
            14px 0 20px;

          color:
            rgba(
              210,
              196,
              165,
              0.68
            );

          font-size: 10px;
          font-weight: 400;

          line-height: 1.55;

          letter-spacing: 0.02em;
        }

        /* =====================================================
           MONEY
           ===================================================== */

        .money-block {
          width: 100%;
        }

        .amount-field {
          width: 100%;

          display: grid;

          grid-template-columns:
            28px
            minmax(0, 1fr)
            31px;

          align-items: center;

          padding-bottom: 7px;

          border-bottom:
            1px solid
            rgba(
              183,
              143,
              72,
              0.48
            );
        }

        .currency {
          color: #c39c56;

          font-size: 23px;
          font-weight: 500;

          line-height: 1;
        }

        .amount-field input {
          width: 100%;
          min-width: 0;

          padding:
            0 8px 0 0;

          border: 0;
          outline: 0;

          background: transparent;

          color: #d6bd8b;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size:
            clamp(
              36px,
              3.25vw,
              52px
            );

          line-height: 1;

          font-weight: 500;

          letter-spacing: 0.015em;

          text-shadow:
            0 3px 14px
            rgba(0, 0, 0, 0.65);
        }

        .amount-field input::placeholder {
          color:
            rgba(
              198,
              170,
              116,
              0.28
            );
        }

        .currency-code {
          color:
            rgba(
              198,
              177,
              135,
              0.48
            );

          font-size: 6px;
          font-weight: 700;

          letter-spacing: 0.17em;
        }

        /* =====================================================
           PRESETS
           ===================================================== */

        .budget-presets {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(5, 1fr);

          gap: 6px;

          margin-top: 12px;
        }

        .preset {
          height: 29px;

          padding: 0;

          border:
            1px solid
            rgba(
              180,
              149,
              94,
              0.22
            );

          background:
            rgba(
              27,
              18,
              11,
              0.28
            );

          color:
            rgba(
              207,
              191,
              157,
              0.62
            );

          cursor: pointer;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 6px;
          font-weight: 700;

          letter-spacing: 0.07em;

          transition:
            border-color 150ms ease,
            background 150ms ease,
            color 150ms ease;
        }

        .preset:hover {
          border-color:
            rgba(
              198,
              158,
              87,
              0.58
            );

          background:
            rgba(
              105,
              70,
              31,
              0.18
            );

          color: #d2b372;
        }

        .preset.active {
          border-color:
            rgba(
              200,
              160,
              88,
              0.7
            );

          background:
            rgba(
              118,
              78,
              33,
              0.22
            );

          color: #d9ba77;
        }

        /* =====================================================
           SCOPE
           ===================================================== */

        .budget-scope {
          margin-top: 13px;

          display: flex;
          align-items: baseline;

          gap: 10px;
        }

        .scope-label {
          flex-shrink: 0;

          color:
            rgba(
              186,
              151,
              89,
              0.66
            );

          font-size: 5px;
          font-weight: 700;

          letter-spacing: 0.16em;
        }

        .budget-scope p {
          margin: 0;

          color:
            rgba(
              199,
              184,
              153,
              0.43
            );

          font-size: 5px;
          font-weight: 600;

          line-height: 1.6;

          letter-spacing: 0.045em;
        }

        .budget-scope p span {
          margin:
            0 4px;

          color:
            rgba(
              184,
              149,
              88,
              0.4
            );
        }

        /* =====================================================
           ERROR
           ===================================================== */

        .budget-error {
          margin:
            10px 0 0;

          color: #d7a184;

          font-size: 7px;

          line-height: 1.45;
        }

        /* =====================================================
           ACTIONS
           ===================================================== */

        .budget-actions {
          margin-top: 20px;

          display: flex;
          align-items: center;

          gap: 19px;
        }

        .continue-button {
          width: 162px;
          height: 39px;

          padding:
            0 15px;

          display: flex;
          align-items: center;
          justify-content:
            space-between;

          border:
            1px solid
            rgba(
              193,
              153,
              82,
              0.58
            );

          background:
            linear-gradient(
              180deg,
              rgba(
                74,
                49,
                23,
                0.32
              ),
              rgba(
                29,
                19,
                11,
                0.32
              )
            );

          color: #d1ae68;

          cursor: pointer;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 7px;
          font-weight: 700;

          letter-spacing: 0.19em;

          box-shadow:
            inset 0 0 18px
            rgba(
              190,
              134,
              54,
              0.025
            );

          transition:
            background 160ms ease,
            border-color 160ms ease,
            color 160ms ease,
            transform 160ms ease;
        }

        .continue-button:hover {
          border-color:
            rgba(
              214,
              174,
              99,
              0.8
            );

          background:
            rgba(
              106,
              70,
              31,
              0.34
            );

          color: #dfc07f;

          transform:
            translateY(-1px);
        }

        .continue-arrow {
          color: #cda65c;

          font-size: 13px;
          font-weight: 400;
        }

        .unknown-button {
          padding:
            5px 0;

          border: 0;
          border-bottom:
            1px solid
            rgba(
              186,
              155,
              101,
              0.18
            );

          background: transparent;

          color:
            rgba(
              202,
              188,
              158,
              0.52
            );

          cursor: pointer;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          font-size: 6px;
          font-weight: 700;

          letter-spacing: 0.14em;

          transition:
            color 150ms ease,
            border-color 150ms ease;
        }

        .unknown-button:hover {
          color: #c8aa6e;

          border-color:
            rgba(
              199,
              166,
              102,
              0.45
            );
        }

        /* =====================================================
           NOTE
           ===================================================== */

        .budget-note {
          margin-top: 16px;

          padding-top: 11px;

          display: grid;

          grid-template-columns:
            18px 1fr;

          gap: 8px;

          border-top:
            1px solid
            rgba(
              180,
              148,
              92,
              0.13
            );
        }

        .note-number {
          color:
            rgba(
              187,
              151,
              88,
              0.52
            );

          font-size: 5px;
          font-weight: 700;

          letter-spacing: 0.1em;
        }

        .budget-note p {
          margin: 0;

          color:
            rgba(
              198,
              184,
              154,
              0.39
            );

          font-size: 6px;
          line-height: 1.5;

          letter-spacing: 0.035em;
        }

        /* =====================================================
           BACK
           ===================================================== */

        .change-way,
        .change-way:link,
        .change-way:visited {
          display: inline-flex;
          align-items: center;

          gap: 7px;

          margin-top: 13px;

          color:
            rgba(
              193,
              173,
              135,
              0.42
            ) !important;

          text-decoration: none;

          font-size: 6px;
          font-weight: 700;

          letter-spacing: 0.13em;

          transition:
            color 150ms ease;
        }

        .change-way:hover {
          color: #c2a366 !important;
        }

        /* =====================================================
           MEDIUM
           ===================================================== */

        @media (
          max-width: 1120px
        ) {
          .budget-nav-links {
            display: none;
          }

          .budget-panel {
            left: 62%;

            width: 34vw;
          }
        }

        /* =====================================================
           MOBILE
           ===================================================== */

        @media (
          max-width: 760px
        ) {
          .budget-page {
            min-height: 760px;

            overflow-y: auto;
          }

          .budget-bg {
            position: fixed;

            object-position:
              55% center;
          }

          .scene-overlay {
            position: fixed;

            background:
              rgba(
                7,
                5,
                3,
                0.58
              );
          }

          .budget-nav {
            position: fixed;

            height: 62px;

            padding:
              0 18px;
          }

          .budget-brand {
            margin-right: 0;

            font-size: 15px;
          }

          .budget-signin {
            display: none;
          }

          .budget-start {
            margin-left: auto;

            height: 32px;

            padding:
              0 10px;

            font-size: 6px;
          }

          .budget-panel {
            position: relative;

            left: auto;
            top: auto;

            width:
              calc(
                100% - 38px
              );

            max-width: 430px;

            margin:
              105px auto 50px;

            padding:
              27px 24px 24px;

            transform: none;

            background:
              rgba(
                27,
                18,
                11,
                0.76
              );

            border:
              1px solid
              rgba(
                187,
                151,
                88,
                0.22
              );

            backdrop-filter:
              blur(8px);
          }

          .budget-heading h1 {
            font-size: 38px;
          }

          .budget-question {
            font-size: 10px;
          }

          .amount-field input {
            font-size: 42px;
          }

          .budget-actions {
            flex-direction: column;

            align-items: stretch;

            gap: 13px;
          }

          .continue-button {
            width: 100%;
          }

          .unknown-button {
            align-self: center;
          }
        }
      `}</style>
    </main>
  );
}
