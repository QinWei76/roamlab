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
      return "/ways-in/hike";

    case "ride":
      return "/ways-in/ride";

    case "paddle":
      return "/ways-in/paddle";

    /*
     * Backward compatibility for Wilds created
     * before the new four Ways In model.
     */
    case "walk":
      return "/ways-in/hike";

    case "bike":
      return "/ways-in/ride";

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
      return "YOUR WILD";
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
    /*
     * Allow digits only.
     * Formatting is handled visually below.
     */
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
        "Enter your total Wild budget, or choose “I DON’T KNOW YET”."
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

      {/* ATMOSPHERE */}
      <div
        className="budget-glow budget-glow-one"
        aria-hidden="true"
      />

      <div
        className="budget-glow budget-glow-two"
        aria-hidden="true"
      />

      <div
        className="budget-grain"
        aria-hidden="true"
      />

      {/* MAIN CONTENT */}
      <section className="budget-stage">
        <div className="budget-context">
          <span className="budget-context-line" />

          <span>
            {getWayInLabel(wayIn)}
          </span>

          <span className="budget-context-dot">
            •
          </span>

          <span>
            PLAN YOUR WILD
          </span>
        </div>

        <p className="budget-eyebrow">
          BEFORE WE BUILD THE PLAN
        </p>

        <h1>
          TOTAL WILD
          <br />
          BUDGET
        </h1>

        <p className="budget-intro">
          How much are you comfortable
          spending on this entire Wild?
        </p>

        {/* BUDGET INPUT */}
        <div className="budget-input-wrap">
          <span className="budget-currency">
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

          <span className="budget-code">
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
                    ? "budget-preset active"
                    : "budget-preset"
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

        <p className="budget-explainer">
          Think about the whole trip —
          travel, campsites, food,
          permits, activities and any
          gear you still need.
        </p>

        <div className="budget-rule" />

        <div className="budget-note">
          <span className="budget-note-number">
            01
          </span>

          <p>
            Gear you already own does
            not count as new spending.
            RoamLab will compare your
            budget with the actual gaps
            in your Wild later.
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
            className="budget-continue"
            onClick={
              continueWithBudget
            }
          >
            CONTINUE
            <span>→</span>
          </button>

          <button
            type="button"
            className="budget-unknown"
            onClick={
              continueWithoutBudget
            }
          >
            I DON&apos;T KNOW YET
          </button>
        </div>

        <Link
          href="/ways-in"
          className="budget-back"
        >
          ← CHANGE WAY IN
        </Link>
      </section>

      <style jsx>{`
        .budget-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 72% 44%,
              rgba(126, 88, 42, 0.16),
              transparent 30%
            ),
            radial-gradient(
              circle at 15% 78%,
              rgba(96, 67, 34, 0.12),
              transparent 28%
            ),
            linear-gradient(
              115deg,
              #080806 0%,
              #11100c 46%,
              #080806 100%
            );
          color: #f2eee5;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .budget-nav {
          position: relative;
          z-index: 20;

          min-height: 82px;
          padding: 0 42px;

          display: flex;
          align-items: center;

          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.08);

          background:
            rgba(6, 6, 5, 0.72);

          backdrop-filter:
            blur(14px);
        }

        .budget-brand {
          color: #f3eee3;
          text-decoration: none;

          font-size: 20px;
          font-weight: 800;
          letter-spacing: 0.16em;

          margin-right: 48px;
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
              244,
              239,
              227,
              0.66
            );

          text-decoration: none;

          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;

          transition:
            color 180ms ease;
        }

        .budget-nav-links a:hover,
        .budget-signin:hover {
          color: #f4efe3;
        }

        .budget-signin {
          margin-left: auto;
        }

        .budget-start {
          margin-left: 28px;

          padding:
            13px 18px;

          border:
            1px solid
            rgba(
              211,
              171,
              100,
              0.58
            );

          color: #e1c58d;
          text-decoration: none;

          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .budget-stage {
          position: relative;
          z-index: 5;

          width:
            min(
              680px,
              calc(100vw - 48px)
            );

          margin:
            clamp(
                72px,
                10vh,
                118px
              )
              auto
              70px;

          text-align: center;
        }

        .budget-context {
          display: flex;
          justify-content: center;
          align-items: center;

          gap: 10px;

          margin-bottom: 35px;

          color:
            rgba(
              213,
              185,
              131,
              0.65
            );

          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.2em;
        }

        .budget-context-line {
          width: 30px;
          height: 1px;

          background:
            rgba(
              213,
              185,
              131,
              0.45
            );
        }

        .budget-context-dot {
          opacity: 0.45;
        }

        .budget-eyebrow {
          margin:
            0 0 17px;

          color: #c5a66d;

          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.28em;
        }

        h1 {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(
              52px,
              7vw,
              86px
            );

          line-height: 0.88;
          font-weight: 400;

          letter-spacing:
            -0.045em;

          text-shadow:
            0 18px 50px
            rgba(0, 0, 0, 0.42);
        }

        .budget-intro {
          max-width: 500px;

          margin:
            28px auto 38px;

          color:
            rgba(
              239,
              234,
              222,
              0.68
            );

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 18px;
          line-height: 1.65;
        }

        .budget-input-wrap {
          position: relative;

          width:
            min(
              500px,
              100%
            );

          margin: 0 auto;

          display: flex;
          align-items: center;

          border-bottom:
            1px solid
            rgba(
              218,
              185,
              119,
              0.52
            );
        }

        .budget-currency {
          padding-left: 8px;

          color: #d7b675;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 38px;
        }

        .budget-input-wrap input {
          min-width: 0;
          width: 100%;

          padding:
            17px 18px 15px;

          border: 0;
          outline: none;

          background:
            transparent;

          color: #f5efe2;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(
              42px,
              6vw,
              64px
            );

          text-align: center;
        }

        .budget-input-wrap input::placeholder {
          color:
            rgba(
              244,
              237,
              220,
              0.18
            );
        }

        .budget-code {
          padding-right: 8px;

          color:
            rgba(
              230,
              218,
              192,
              0.42
            );

          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.18em;
        }

        .budget-presets {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;

          gap: 9px;

          margin-top: 20px;
        }

        .budget-preset {
          padding:
            8px 13px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.11
            );

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          color:
            rgba(
              242,
              236,
              222,
              0.56
            );

          cursor: pointer;

          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;

          transition:
            160ms ease;
        }

        .budget-preset:hover,
        .budget-preset.active {
          border-color:
            rgba(
              215,
              182,
              117,
              0.7
            );

          color: #dfc58f;

          background:
            rgba(
              215,
              182,
              117,
              0.08
            );
        }

        .budget-explainer {
          max-width: 470px;

          margin:
            27px auto 0;

          color:
            rgba(
              235,
              229,
              216,
              0.47
            );

          font-size: 11px;
          line-height: 1.8;
          letter-spacing: 0.04em;
        }

        .budget-rule {
          width: 100%;
          height: 1px;

          margin:
            37px 0 25px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(
                255,
                255,
                255,
                0.13
              ),
              transparent
            );
        }

        .budget-note {
          max-width: 500px;

          margin:
            0 auto;

          display: grid;
          grid-template-columns:
            36px 1fr;

          gap: 14px;

          text-align: left;
        }

        .budget-note-number {
          color: #c5a66d;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 11px;
        }

        .budget-note p {
          margin: 0;

          color:
            rgba(
              234,
              227,
              212,
              0.45
            );

          font-size: 10px;
          line-height: 1.7;
          letter-spacing: 0.035em;
        }

        .budget-error {
          margin:
            23px 0 0;

          color: #d9a28d;

          font-size: 11px;
          line-height: 1.5;
        }

        .budget-actions {
          margin-top: 37px;

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 17px;
        }

        .budget-continue {
          min-width: 230px;

          padding:
            16px 25px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 28px;

          border:
            1px solid
            rgba(
              215,
              182,
              117,
              0.75
            );

          background:
            rgba(
              215,
              182,
              117,
              0.1
            );

          color: #e6ca91;

          cursor: pointer;

          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.2em;

          transition:
            transform 180ms ease,
            background 180ms ease;
        }

        .budget-continue:hover {
          transform:
            translateY(-2px);

          background:
            rgba(
              215,
              182,
              117,
              0.17
            );
        }

        .budget-continue span {
          font-size: 15px;
        }

        .budget-unknown {
          border: 0;

          background: none;

          color:
            rgba(
              239,
              232,
              217,
              0.48
            );

          cursor: pointer;

          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.17em;

          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.12
            );

          padding:
            0 0 5px;
        }

        .budget-unknown:hover {
          color: #d8bc85;
        }

        .budget-back {
          display: inline-block;

          margin-top: 37px;

          color:
            rgba(
              237,
              230,
              215,
              0.32
            );

          text-decoration: none;

          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.16em;
        }

        .budget-back:hover {
          color:
            rgba(
              237,
              230,
              215,
              0.7
            );
        }

        .budget-glow {
          position: absolute;

          border-radius: 50%;

          filter: blur(80px);

          pointer-events: none;
        }

        .budget-glow-one {
          width: 430px;
          height: 430px;

          right: -110px;
          top: 180px;

          background:
            rgba(
              160,
              107,
              43,
              0.08
            );
        }

        .budget-glow-two {
          width: 350px;
          height: 350px;

          left: -120px;
          bottom: -80px;

          background:
            rgba(
              124,
              88,
              46,
              0.07
            );
        }

        .budget-grain {
          position: absolute;
          inset: 0;

          pointer-events: none;

          opacity: 0.14;

          background-image:
            repeating-linear-gradient(
              0deg,
              rgba(
                  255,
                  255,
                  255,
                  0.018
                )
                0,
              rgba(
                  255,
                  255,
                  255,
                  0.018
                )
                1px,
              transparent 1px,
              transparent 3px
            );
        }

        @media (
          max-width: 1050px
        ) {
          .budget-nav-links {
            display: none;
          }
        }

        @media (
          max-width: 700px
        ) {
          .budget-nav {
            min-height: 70px;

            padding:
              0 20px;
          }

          .budget-brand {
            margin-right: 0;

            font-size: 17px;
          }

          .budget-signin {
            display: none;
          }

          .budget-start {
            margin-left: auto;

            padding:
              11px 12px;

            font-size: 8px;
          }

          .budget-stage {
            width:
              calc(
                100vw - 36px
              );

            margin-top: 58px;
          }

          .budget-context {
            margin-bottom: 27px;
          }

          h1 {
            font-size:
              clamp(
                48px,
                16vw,
                68px
              );
          }

          .budget-intro {
            font-size: 16px;
          }

          .budget-input-wrap input {
            font-size: 46px;
          }

          .budget-currency {
            font-size: 30px;
          }
        }
      `}</style>
    </main>
  );
}
