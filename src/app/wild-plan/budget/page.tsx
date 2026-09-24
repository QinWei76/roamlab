"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentWild,
  updateWildBudget,
} from "@/lib/wildStore";

import type { WildWayIn } from "@/types/wild";

const BUDGET_PRESETS = [
  500,
  1000,
  2000,
  3000,
  5000,
];

function getNextRoute(
  wayIn?: WildWayIn
): string {
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

function getWayInLabel(
  wayIn?: WildWayIn
): string {
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

  const [wayIn, setWayIn] =
    useState<WildWayIn>();

  const [budget, setBudget] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    const wild = getCurrentWild();

    if (!wild) {
      router.replace("/ways-in");
      return;
    }

    const selectedWayIn =
      wild.plan.adventure.wayIn;

    setWayIn(selectedWayIn);

    const existingBudget =
      wild.plan.cost?.totalWildBudget;

    const budgetStatus =
      wild.plan.cost?.budgetStatus;

    if (
      budgetStatus === "set" &&
      typeof existingBudget === "number"
    ) {
      setBudget(
        String(existingBudget)
      );
    }
  }, [router]);

  function choosePreset(
    amount: number
  ) {
    setBudget(String(amount));
    setError("");
  }

  function handleBudgetChange(
    value: string
  ) {
    const cleaned =
      value.replace(/[^\d]/g, "");

    setBudget(cleaned);
    setError("");
  }

  function continueWithBudget() {
    const amount =
      Number(budget);

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

    router.push(
      getNextRoute(wayIn)
    );
  }

  function continueWithoutBudget() {
    updateWildBudget({
      status: "unknown",
      currency: "USD",
    });

    router.push(
      getNextRoute(wayIn)
    );
  }

  const formattedBudget =
    budget
      ? Number(
          budget
        ).toLocaleString("en-US")
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
        className="budget-vignette"
        aria-hidden="true"
      />

      {/* TOP NAV */}
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
          START YOUR WILD →
        </Link>
      </nav>

      {/* BUDGET PANEL */}
      <section className="budget-panel">
        <div className="budget-kicker">
          <span className="budget-line" />

          <span>
            {getWayInLabel(wayIn)}
          </span>

          <span className="budget-dot">
            •
          </span>

          <span>
            WILD BUDGET
          </span>
        </div>

        <h1>
          TOTAL WILD
          <br />
          BUDGET
        </h1>

        <p className="budget-question">
          How much are you comfortable
          spending on this entire Wild?
        </p>

        {/* AMOUNT */}
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
          {BUDGET_PRESETS.map(
            (amount) => (
              <button
                key={amount}
                type="button"
                onClick={() =>
                  choosePreset(amount)
                }
                className={
                  Number(budget) ===
                  amount
                    ? "preset active"
                    : "preset"
                }
              >
                $
                {amount.toLocaleString(
                  "en-US"
                )}
              </button>
            )
          )}
        </div>

        <p className="budget-description">
          Travel · campsites · food ·
          permits · activities · gear
          you still need
        </p>

        {error && (
          <p
            className="budget-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="budget-actions">
          <button
            type="button"
            className="continue-button"
            onClick={
              continueWithBudget
            }
          >
            <span>
              CONTINUE
            </span>

            <span className="arrow">
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

        <p className="budget-footnote">
          Already-owned gear does not
          count as new spending.
        </p>

        <Link
          href="/ways-in"
          className="change-way"
        >
          ← CHANGE WAY IN
        </Link>
      </section>

      <style jsx>{`
        .budget-page {
          position: relative;

          width: 100%;
          height: 100vh;
          min-height: 720px;

          overflow: hidden;

          background: #090806;

          color: #eee7d8;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        /* =========================
           BACKGROUND
           ========================= */

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

        .budget-vignette {
          position: absolute;
          inset: 0;

          pointer-events: none;

          background:
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.34)
                0%,
              rgba(0, 0, 0, 0.04)
                20%,
              rgba(0, 0, 0, 0.02)
                72%,
              rgba(0, 0, 0, 0.28)
                100%
            );
        }

        /* =========================
           NAVIGATION
           ========================= */

        .budget-nav {
          position: absolute;
          z-index: 20;

          top: 0;
          left: 0;
          right: 0;

          height: 72px;

          padding:
            0 34px;

          display: flex;
          align-items: center;

          box-sizing: border-box;

          background:
            linear-gradient(
              180deg,
              rgba(4, 4, 3, 0.82),
              rgba(4, 4, 3, 0.32),
              transparent
            );
        }

        .budget-brand {
          flex-shrink: 0;

          margin-right: 44px;

          color: #f0e9dc;

          text-decoration: none;

          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .budget-nav-links {
          display: flex;
          align-items: center;

          gap: 25px;
        }

        .budget-nav-links a,
        .budget-signin {
          color:
            rgba(
              238,
              231,
              216,
              0.68
            );

          text-decoration: none;

          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;

          transition:
            color 160ms ease;
        }

        .budget-nav-links a:hover,
        .budget-signin:hover {
          color: #f0e8d8;
        }

        .budget-signin {
          margin-left: auto;
        }

        .budget-start {
          flex-shrink: 0;

          margin-left: 25px;

          padding:
            11px 15px;

          border:
            1px solid
            rgba(
              207,
              171,
              102,
              0.48
            );

          background:
            rgba(
              16,
              13,
              9,
              0.25
            );

          color: #d8bd87;

          text-decoration: none;

          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        /* =========================
           INTERACTION PANEL
           ========================= */

        .budget-panel {
          position: absolute;
          z-index: 10;

          /*
           * The leather planning pad in
           * wild-budget.jpg occupies the
           * right side of the composition.
           */
          left: 66.5%;
          top: 53%;

          width:
            min(
              430px,
              29vw
            );

          transform:
            translateY(-50%);

          text-align: left;

          text-shadow:
            0 2px 12px
            rgba(0, 0, 0, 0.52);
        }

        .budget-kicker {
          display: flex;
          align-items: center;

          gap: 9px;

          margin-bottom: 16px;

          color:
            rgba(
              218,
              183,
              116,
              0.78
            );

          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.19em;
        }

        .budget-line {
          width: 24px;
          height: 1px;

          background:
            rgba(
              218,
              183,
              116,
              0.58
            );
        }

        .budget-dot {
          opacity: 0.45;
        }

        h1 {
          margin: 0;

          color: #eee5d5;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(
              34px,
              3.4vw,
              54px
            );

          line-height: 0.91;

          font-weight: 400;

          letter-spacing:
            -0.035em;
        }

        .budget-question {
          max-width: 350px;

          margin:
            17px 0 23px;

          color:
            rgba(
              239,
              231,
              216,
              0.66
            );

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 13px;
          line-height: 1.5;
        }

        /* =========================
           AMOUNT
           ========================= */

        .amount-field {
          position: relative;

          width: 100%;

          display: grid;

          grid-template-columns:
            30px
            minmax(0, 1fr)
            34px;

          align-items: center;

          border-bottom:
            1px solid
            rgba(
              210,
              174,
              105,
              0.55
            );

          padding-bottom: 4px;
        }

        .currency {
          color: #d6b36c;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 26px;
        }

        .amount-field input {
          width: 100%;
          min-width: 0;

          box-sizing: border-box;

          border: 0;
          outline: 0;

          padding:
            5px 8px 5px 0;

          background:
            transparent;

          color: #f1e8d8;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(
              38px,
              3.6vw,
              57px
            );

          line-height: 1;

          text-align: left;

          text-shadow:
            0 3px 14px
            rgba(0, 0, 0, 0.4);
        }

        .amount-field input::placeholder {
          color:
            rgba(
              238,
              228,
              208,
              0.24
            );
        }

        .currency-code {
          align-self: center;

          color:
            rgba(
              233,
              221,
              198,
              0.44
            );

          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.15em;
        }

        /* =========================
           PRESETS
           ========================= */

        .budget-presets {
          display: grid;

          grid-template-columns:
            repeat(5, 1fr);

          gap: 6px;

          margin-top: 13px;
        }

        .preset {
          height: 30px;

          padding: 0;

          border:
            1px solid
            rgba(
              229,
              216,
              190,
              0.15
            );

          background:
            rgba(
              17,
              13,
              9,
              0.26
            );

          color:
            rgba(
              236,
              225,
              204,
              0.56
            );

          cursor: pointer;

          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.08em;

          transition:
            160ms ease;
        }

        .preset:hover {
          border-color:
            rgba(
              214,
              179,
              108,
              0.6
            );

          color: #dfc58f;
        }

        .preset.active {
          border-color:
            rgba(
              214,
              179,
              108,
              0.72
            );

          background:
            rgba(
              199,
              157,
              83,
              0.13
            );

          color: #e1c78f;
        }

        .budget-description {
          margin:
            13px 0 0;

          color:
            rgba(
              235,
              224,
              203,
              0.4
            );

          font-size: 7px;
          line-height: 1.55;
          letter-spacing: 0.055em;
        }

        /* =========================
           ACTIONS
           ========================= */

        .budget-error {
          margin:
            10px 0 0;

          color: #e0a88d;

          font-size: 8px;
          line-height: 1.4;
        }

        .budget-actions {
          display: flex;
          align-items: center;

          gap: 18px;

          margin-top: 21px;
        }

        .continue-button {
          min-width: 165px;
          height: 40px;

          padding:
            0 17px;

          display: flex;
          align-items: center;
          justify-content:
            space-between;

          border:
            1px solid
            rgba(
              218,
              183,
              116,
              0.67
            );

          background:
            rgba(
              24,
              18,
              11,
              0.36
            );

          color: #e2c68e;

          cursor: pointer;

          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.18em;

          transition:
            background 160ms ease,
            transform 160ms ease;
        }

        .continue-button:hover {
          background:
            rgba(
              203,
              161,
              88,
              0.15
            );

          transform:
            translateY(-1px);
        }

        .arrow {
          font-size: 14px;
        }

        .unknown-button {
          padding:
            5px 0;

          border: 0;
          border-bottom:
            1px solid
            rgba(
              235,
              223,
              199,
              0.18
            );

          background:
            transparent;

          color:
            rgba(
              237,
              225,
              202,
              0.48
            );

          cursor: pointer;

          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.13em;
        }

        .unknown-button:hover {
          color: #d7bd88;
        }

        .budget-footnote {
          margin:
            15px 0 0;

          color:
            rgba(
              230,
              217,
              192,
              0.34
            );

          font-size: 7px;
          line-height: 1.45;
          letter-spacing: 0.045em;
        }

        .change-way {
          display: inline-block;

          margin-top: 16px;

          color:
            rgba(
              231,
              218,
              193,
              0.35
            );

          text-decoration: none;

          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .change-way:hover {
          color:
            rgba(
              231,
              218,
              193,
              0.72
            );
        }

        /* =========================
           RESPONSIVE
           ========================= */

        @media (
          max-width: 1100px
        ) {
          .budget-nav-links {
            display: none;
          }

          .budget-panel {
            left: 61%;

            width: 34vw;
          }
        }

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
              58% center;
          }

          .budget-vignette {
            position: fixed;

            background:
              rgba(
                5,
                4,
                3,
                0.58
              );
          }

          .budget-nav {
            position: fixed;

            height: 64px;

            padding:
              0 18px;
          }

          .budget-brand {
            margin-right: 0;

            font-size: 16px;
          }

          .budget-signin {
            display: none;
          }

          .budget-start {
            margin-left: auto;

            padding:
              10px 11px;

            font-size: 7px;
          }

          .budget-panel {
            position: relative;

            left: auto;
            top: auto;

            width:
              calc(
                100% - 42px
              );

            max-width: 440px;

            transform: none;

            margin:
              118px auto 60px;

            padding:
              30px 26px;

            box-sizing: border-box;

            background:
              rgba(
                18,
                13,
                9,
                0.72
              );

            border:
              1px solid
              rgba(
                218,
                183,
                116,
                0.18
              );

            backdrop-filter:
              blur(8px);
          }

          h1 {
            font-size: 44px;
          }

          .amount-field input {
            font-size: 45px;
          }

          .budget-actions {
            flex-direction: column;
            align-items: stretch;
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
