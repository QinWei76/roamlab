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

    setWayIn(wild.plan.adventure.wayIn);

    const existingBudget =
      wild.plan.cost?.totalWildBudget;

    const budgetStatus =
      wild.plan.cost?.budgetStatus;

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

    if (!budget || !Number.isFinite(amount) || amount <= 0) {
      setError(
        "ENTER A BUDGET OR CHOOSE I DON'T KNOW YET."
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
      {/* =====================================================
          SCENE
      ===================================================== */}

      <img
        src="/wild-budget.jpg"
        alt=""
        className="scene-image"
        draggable={false}
      />

      <div className="scene-overlay" />

      {/* =====================================================
          HEADER — SAME LANGUAGE AS VEHICLE PAGE
      ===================================================== */}

      <header className="site-header">
        <Link href="/" className="roamlab-brand">
          <strong>ROAMLAB</strong>

          <span>
            PLANS · GEAR · STORIES
          </span>
        </Link>

        <nav className="site-nav">
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

          <Link href="/signin">
            SIGN IN
          </Link>

          <Link
            href="/ways-in"
            className="header-cta"
          >
            START YOUR WILD →
          </Link>
        </nav>
      </header>

      {/* =====================================================
          BUDGET PANEL
      ===================================================== */}

      <section className="budget-panel">
        <div className="step-context">
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

        <h1>
          TOTAL WILD
          <br />
          BUDGET
        </h1>

        <p className="subtitle">
          HOW MUCH ARE YOU COMFORTABLE
          <br />
          SPENDING ON THIS WILD?
        </p>

        {/* =====================================================
            MAIN NUMBER
        ===================================================== */}

        <div className="budget-number">
          <span className="currency-symbol">
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

        <div className="orange-rule" />

        {/* =====================================================
            PRESETS
        ===================================================== */}

        <div className="preset-row">
          {BUDGET_PRESETS.map((amount) => {
            const active =
              Number(budget) === amount;

            return (
              <button
                key={amount}
                type="button"
                onClick={() =>
                  choosePreset(amount)
                }
                className={
                  active
                    ? "preset-button active"
                    : "preset-button"
                }
              >
                $
                {amount.toLocaleString(
                  "en-US"
                )}
              </button>
            );
          })}
        </div>

        {/* =====================================================
            BUDGET CONTENT
        ===================================================== */}

        <div className="budget-covers">
          <span className="covers-label">
            BUDGET COVERS
          </span>

          <p>
            TRAVEL
            <i>•</i>
            CAMPSITES
            <i>•</i>
            FOOD
            <i>•</i>
            PERMITS
            <i>•</i>
            ACTIVITIES
            <i>•</i>
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

        {/* =====================================================
            PRIMARY ACTION
        ===================================================== */}

        <button
          type="button"
          className="continue-button"
          onClick={continueWithBudget}
        >
          <span>
            CONTINUE
          </span>

          <span className="button-arrow">
            →
          </span>
        </button>

        {/* =====================================================
            SECONDARY ACTION
        ===================================================== */}

        <button
          type="button"
          className="unknown-button"
          onClick={continueWithoutBudget}
        >
          I DON&apos;T KNOW YET
        </button>

        {/* =====================================================
            FOOT NOTE
        ===================================================== */}

        <div className="planning-note">
          <span className="note-number">
            01
          </span>

          <div>
            <strong>
              ALREADY OWNED GEAR
            </strong>

            <p>
              Gear you already own does not count
              as new spending.
            </p>
          </div>
        </div>

        <Link
          href="/ways-in"
          className="change-way"
        >
          ← CHANGE WAY IN
        </Link>
      </section>

      <style jsx>{`
        /* =====================================================
           BASE
        ===================================================== */

        .budget-page {
          position: relative;

          width: 100vw;
          height: 100vh;

          min-width: 100%;
          min-height: 720px;

          overflow: hidden;

          background: #080604;

          color: #f1eee6;

          font-family:
            "Arial Narrow",
            "Helvetica Neue",
            Arial,
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

        .scene-image {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;
          object-position: center;

          user-select: none;
          pointer-events: none;
        }

        .scene-overlay {
          position: absolute;

          inset: 0;

          pointer-events: none;

          background:
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.46) 0%,
              rgba(0, 0, 0, 0.08) 13%,
              transparent 30%,
              transparent 72%,
              rgba(0, 0, 0, 0.16) 100%
            ),
            linear-gradient(
              90deg,
              transparent 53%,
              rgba(0, 0, 0, 0.03) 64%,
              rgba(0, 0, 0, 0.16) 100%
            );
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .site-header {
          position: absolute;

          z-index: 50;

          top: 0;
          left: 0;
          right: 0;

          height: 73px;

          padding:
            11px 26px 9px;

          display: flex;
          align-items: flex-start;

          background:
            linear-gradient(
              180deg,
              rgba(4, 4, 3, 0.84) 0%,
              rgba(4, 4, 3, 0.44) 70%,
              transparent 100%
            );
        }

        /* =====================================================
           BRAND
        ===================================================== */

        :global(.roamlab-brand),
        :global(.roamlab-brand:link),
        :global(.roamlab-brand:visited),
        :global(.roamlab-brand:active) {
          display: flex;

          flex-direction: column;

          flex-shrink: 0;

          gap: 4px;

          color: #eee8dd !important;

          text-decoration: none !important;

          text-shadow:
            0 2px 7px
            rgba(0, 0, 0, 0.72);
        }

        :global(.roamlab-brand strong) {
          display: block;

          font-size: 27px;
          line-height: 1;

          font-weight: 900;

          letter-spacing:
            0.08em;

          transform:
            scaleX(0.86);

          transform-origin:
            left center;
        }

        :global(.roamlab-brand span) {
          font-size: 9px;

          font-weight: 800;

          letter-spacing:
            0.15em;

          color:
            rgba(
              239,
              233,
              222,
              0.78
            );
        }

        /* =====================================================
           NAV
        ===================================================== */

        .site-nav {
          margin-left: auto;

          height: 38px;

          display: flex;
          align-items: center;

          gap: 25px;
        }

        :global(.site-nav a),
        :global(.site-nav a:link),
        :global(.site-nav a:visited),
        :global(.site-nav a:active) {
          color:
            rgba(
              245,
              240,
              230,
              0.88
            ) !important;

          text-decoration:
            none !important;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 8px;
          line-height: 1;

          font-weight: 700;

          letter-spacing:
            0.055em;

          white-space: nowrap;

          text-shadow:
            0 2px 5px
            rgba(0, 0, 0, 0.75);

          transition:
            color 150ms ease;
        }

        :global(.site-nav a:hover) {
          color: #f2a323 !important;
        }

        /* =====================================================
           HEADER CTA
        ===================================================== */

        :global(.site-nav .header-cta),
        :global(.site-nav .header-cta:link),
        :global(.site-nav .header-cta:visited),
        :global(.site-nav .header-cta:active) {
          height: 39px;

          margin-left: 1px;

          padding:
            0 18px;

          display: flex;
          align-items: center;

          background: #eea326;

          border:
            1px solid
            rgba(
              255,
              186,
              65,
              0.92
            );

          border-radius: 5px;

          color: #171108 !important;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 8px;

          font-weight: 800;

          letter-spacing:
            0.035em;

          text-shadow: none;

          box-shadow:
            0 4px 14px
            rgba(
              0,
              0,
              0,
              0.2
            );

          transition:
            background 150ms ease,
            transform 150ms ease;
        }

        :global(.site-nav .header-cta:hover) {
          background: #f6ae35;

          color: #171108 !important;

          transform:
            translateY(-1px);
        }

        /* =====================================================
           BUDGET PANEL
        ===================================================== */

        .budget-panel {
          position: absolute;

          z-index: 20;

          /*
           * Leather work pad in wild-budget.jpg.
           * Keep this area visually open.
           */

          left: 65.7%;
          top: 53%;

          width:
            min(
              510px,
              32vw
            );

          transform:
            translateY(-50%);

          color: #f2ede3;

          text-align: left;

          text-shadow:
            0 2px 9px
            rgba(0, 0, 0, 0.78);
        }

        /* =====================================================
           CONTEXT
        ===================================================== */

        .step-context {
          display: flex;

          align-items: center;

          gap: 10px;

          margin-bottom: 12px;

          color: #eea326;

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            0.17em;
        }

        .context-line {
          width: 31px;
          height: 2px;

          background: #eea326;
        }

        .context-dot {
          opacity: 0.45;
        }

        /* =====================================================
           TITLE
        ===================================================== */

        h1 {
          margin: 0;

          color: #f1ede4;

          font-family:
            "Arial Narrow",
            Impact,
            "Helvetica Neue",
            Arial,
            sans-serif;

          font-size:
            clamp(
              48px,
              4vw,
              65px
            );

          line-height: 0.84;

          font-weight: 900;

          letter-spacing:
            -0.035em;

          text-transform: uppercase;

          transform:
            scaleX(0.9);

          transform-origin:
            left center;

          text-shadow:
            0 4px 16px
            rgba(0, 0, 0, 0.8);
        }

        .subtitle {
          margin:
            17px 0 17px;

          color:
            rgba(
              241,
              236,
              226,
              0.73
            );

          font-size: 9px;

          line-height: 1.55;

          font-weight: 800;

          letter-spacing:
            0.07em;
        }

        /* =====================================================
           BIG BUDGET NUMBER
        ===================================================== */

        .budget-number {
          width: 100%;

          display: grid;

          grid-template-columns:
            45px
            minmax(0, 1fr)
            43px;

          align-items: center;
        }

        .currency-symbol {
          color: #eea326;

          font-family:
            "Arial Narrow",
            Impact,
            Arial,
            sans-serif;

          font-size: 43px;

          line-height: 1;

          font-weight: 900;
        }

        .budget-number input {
          width: 100%;

          min-width: 0;

          padding:
            0 10px 0 0;

          border: 0;

          outline: none;

          background: transparent;

          color: #f5f0e7;

          font-family:
            "Arial Narrow",
            Impact,
            "Helvetica Neue",
            Arial,
            sans-serif;

          font-size:
            clamp(
              74px,
              6.1vw,
              100px
            );

          line-height: 0.9;

          font-weight: 900;

          letter-spacing:
            -0.04em;

          text-shadow:
            0 5px 20px
            rgba(0, 0, 0, 0.86);
        }

        .budget-number input::placeholder {
          color:
            rgba(
              245,
              240,
              231,
              0.32
            );

          opacity: 1;
        }

        .currency-code {
          color:
            rgba(
              240,
              234,
              222,
              0.62
            );

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            0.14em;
        }

        .orange-rule {
          width: 100%;

          height: 2px;

          margin-top: 5px;

          background:
            linear-gradient(
              90deg,
              #eea326 0%,
              rgba(
                238,
                163,
                38,
                0.62
              ) 58%,
              rgba(
                238,
                163,
                38,
                0.12
              ) 100%
            );
        }

        /* =====================================================
           PRESET BUTTONS
        ===================================================== */

        .preset-row {
          width: 100%;

          margin-top: 14px;

          display: grid;

          grid-template-columns:
            repeat(5, 1fr);

          gap: 8px;
        }

        .preset-button {
          height: 37px;

          padding: 0;

          border:
            1px solid
            rgba(
              242,
              237,
              227,
              0.3
            );

          background:
            rgba(
              7,
              7,
              6,
              0.64
            );

          color:
            rgba(
              242,
              237,
              227,
              0.78
            );

          cursor: pointer;

          font-family:
            "Arial Narrow",
            Arial,
            sans-serif;

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            0.055em;

          box-shadow:
            0 3px 10px
            rgba(
              0,
              0,
              0,
              0.18
            );

          transition:
            border-color 150ms ease,
            background 150ms ease,
            color 150ms ease,
            transform 150ms ease;
        }

        .preset-button:hover {
          border-color:
            rgba(
              238,
              163,
              38,
              0.9
            );

          color: #ffffff;

          transform:
            translateY(-1px);
        }

        .preset-button.active {
          border-color: #eea326;

          background:
            rgba(
              238,
              163,
              38,
              0.18
            );

          color: #eea326;
        }

        /* =====================================================
           BUDGET COVERS
        ===================================================== */

        .budget-covers {
          margin-top: 14px;
        }

        .covers-label {
          display: block;

          margin-bottom: 6px;

          color: #eea326;

          font-size: 7px;

          font-weight: 900;

          letter-spacing:
            0.14em;
        }

        .budget-covers p {
          margin: 0;

          display: flex;

          flex-wrap: wrap;

          align-items: center;

          gap: 6px;

          color:
            rgba(
              239,
              233,
              221,
              0.56
            );

          font-size: 6px;

          font-weight: 800;

          line-height: 1.5;

          letter-spacing:
            0.055em;
        }

        .budget-covers i {
          color:
            rgba(
              238,
              163,
              38,
              0.65
            );

          font-style: normal;
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .budget-error {
          margin:
            10px 0 0;

          color: #ffc090;

          font-size: 8px;

          font-weight: 700;

          letter-spacing:
            0.03em;
        }

        /* =====================================================
           CONTINUE
        ===================================================== */

        .continue-button {
          width: 100%;

          height: 52px;

          margin-top: 22px;

          padding:
            0 20px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          border:
            1px solid
            rgba(
              255,
              184,
              55,
              0.96
            );

          border-radius: 2px;

          background: #eea326;

          color: #171108;

          cursor: pointer;

          font-family:
            "Arial Narrow",
            "Helvetica Neue",
            Arial,
            sans-serif;

          font-size: 11px;

          font-weight: 900;

          letter-spacing:
            0.11em;

          text-shadow: none;

          box-shadow:
            0 6px 18px
            rgba(
              0,
              0,
              0,
              0.25
            );

          transition:
            background 150ms ease,
            transform 150ms ease,
            box-shadow 150ms ease;
        }

        .continue-button:hover {
          background: #f7ae31;

          transform:
            translateY(-1px);

          box-shadow:
            0 8px 22px
            rgba(
              0,
              0,
              0,
              0.3
            );
        }

        .button-arrow {
          font-size: 20px;

          line-height: 1;
        }

        /* =====================================================
           UNKNOWN
        ===================================================== */

        .unknown-button {
          display: block;

          margin:
            13px auto 0;

          padding:
            7px 2px;

          border: 0;

          border-bottom:
            1px solid
            rgba(
              240,
              234,
              222,
              0.28
            );

          background: transparent;

          color:
            rgba(
              244,
              239,
              229,
              0.74
            );

          cursor: pointer;

          font-family:
            "Arial Narrow",
            Arial,
            sans-serif;

          font-size: 8px;

          font-weight: 900;

          letter-spacing:
            0.11em;

          text-shadow:
            0 2px 8px
            rgba(
              0,
              0,
              0,
              0.75
            );

          transition:
            color 150ms ease,
            border-color 150ms ease;
        }

        .unknown-button:hover {
          color: #eea326;

          border-color:
            rgba(
              238,
              163,
              38,
              0.75
            );
        }

        /* =====================================================
           NOTE
        ===================================================== */

        .planning-note {
          margin-top: 18px;

          padding-top: 13px;

          display: grid;

          grid-template-columns:
            27px
            1fr;

          gap: 10px;

          border-top:
            1px solid
            rgba(
              244,
              239,
              229,
              0.16
            );
        }

        .note-number {
          color: #eea326;

          font-size: 7px;

          font-weight: 900;

          letter-spacing:
            0.08em;
        }

        .planning-note strong {
          display: block;

          margin-bottom: 3px;

          color:
            rgba(
              244,
              239,
              229,
              0.78
            );

          font-size: 7px;

          font-weight: 900;

          letter-spacing:
            0.09em;
        }

        .planning-note p {
          margin: 0;

          color:
            rgba(
              239,
              233,
              221,
              0.5
            );

          font-size: 7px;

          line-height: 1.5;

          letter-spacing:
            0.02em;
        }

        /* =====================================================
           CHANGE WAY IN
        ===================================================== */

        :global(.change-way),
        :global(.change-way:link),
        :global(.change-way:visited),
        :global(.change-way:active) {
          display: inline-block;

          margin-top: 13px;

          color:
            rgba(
              242,
              237,
              227,
              0.62
            ) !important;

          text-decoration:
            none !important;

          font-family:
            "Arial Narrow",
            Arial,
            sans-serif;

          font-size: 7px;

          font-weight: 900;

          letter-spacing:
            0.1em;

          transition:
            color 150ms ease;
        }

        :global(.change-way:hover) {
          color: #eea326 !important;
        }

        /* =====================================================
           FORCE REMOVE BROWSER PURPLE LINKS
        ===================================================== */

        :global(.budget-page a),
        :global(.budget-page a:link),
        :global(.budget-page a:visited),
        :global(.budget-page a:active) {
          text-decoration: none !important;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1180px) {
          .site-nav {
            gap: 16px;
          }

          :global(.site-nav a) {
            font-size: 7px;
          }

          .budget-panel {
            left: 61%;

            width: 36vw;
          }

          .budget-number input {
            font-size: 72px;
          }
        }

        @media (max-width: 980px) {
          .site-nav
            :global(a:not(.header-cta)) {
            display: none;
          }

          .budget-panel {
            left: 56%;

            width: 40vw;
          }
        }

        @media (max-width: 760px) {
          .budget-page {
            min-height: 820px;

            overflow-y: auto;
          }

          .scene-image {
            position: fixed;

            object-position:
              58% center;
          }

          .scene-overlay {
            position: fixed;

            background:
              rgba(
                5,
                4,
                3,
                0.6
              );
          }

          .site-header {
            position: fixed;

            height: 67px;

            padding:
              11px 17px;
          }

          :global(.roamlab-brand strong) {
            font-size: 21px;
          }

          :global(.roamlab-brand span) {
            font-size: 6px;
          }

          :global(.header-cta) {
            height: 36px !important;

            padding:
              0 11px !important;

            font-size:
              7px !important;
          }

          .budget-panel {
            position: relative;

            left: auto;
            top: auto;

            width:
              calc(
                100% - 36px
              );

            max-width: 470px;

            margin:
              100px auto 50px;

            padding:
              27px 23px 24px;

            transform: none;

            background:
              rgba(
                8,
                7,
                5,
                0.82
              );

            border:
              1px solid
              rgba(
                244,
                239,
                229,
                0.2
              );

            backdrop-filter:
              blur(7px);
          }

          h1 {
            font-size: 48px;
          }

          .budget-number {
            grid-template-columns:
              37px
              minmax(0, 1fr)
              35px;
          }

          .currency-symbol {
            font-size: 34px;
          }

          .budget-number input {
            font-size: 62px;
          }

          .preset-row {
            gap: 5px;
          }

          .preset-button {
            font-size: 7px;
          }
        }
      `}</style>
    </main>
  );
}
