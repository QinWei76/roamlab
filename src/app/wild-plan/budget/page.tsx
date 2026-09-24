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

    if (
      !budget ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError(
        "Enter your budget or choose I DON'T KNOW YET."
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

      <div className="scene-shade" />

      {/* =====================================================
          ROAMLAB NAV
      ===================================================== */}

      <header className="roamlab-header">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <span className="brand-mountain">
              ▲
            </span>
          </span>

          <span className="brand-name">
            ROAMLAB
          </span>
        </Link>

        <nav className="main-nav">
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
        </nav>

        <div className="header-actions">
          <Link
            href="/signin"
            className="signin-button"
          >
            <span className="signin-icon">
              ↪
            </span>

            SIGN IN
          </Link>

          <Link
            href="/ways-in"
            className="start-button"
          >
            START YOUR WILD
            <span>→</span>
          </Link>
        </div>
      </header>

      {/* =====================================================
          BUDGET WORKSPACE
      ===================================================== */}

      <section className="budget-workspace">
        {/* WAY IN */}

        <div className="way-label">
          <span className="way-line" />

          <span>
            {getWayInLabel(wayIn)}
          </span>

          <span className="way-dot">
            •
          </span>

          <span>
            WILD BUDGET
          </span>
        </div>

        {/* TITLE */}

        <div className="title-block">
          <p className="step-label">
            PLAN THE REAL COST
          </p>

          <h1>
            TOTAL WILD
            <br />
            BUDGET
          </h1>

          <p className="question">
            How much are you comfortable spending
            on this entire Wild?
          </p>
        </div>

        {/* =====================================================
            AMOUNT
        ===================================================== */}

        <div className="amount-section">
          <div className="amount-row">
            <span className="dollar">
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

            <span className="usd">
              USD
            </span>
          </div>

          <div className="amount-rule" />

          {/* PRESETS */}

          <div className="presets">
            {BUDGET_PRESETS.map(
              (amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() =>
                    choosePreset(amount)
                  }
                  className={
                    Number(budget) === amount
                      ? "preset selected"
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
        </div>

        {/* =====================================================
            COST SCOPE
        ===================================================== */}

        <div className="cost-scope">
          <span className="scope-title">
            THIS BUDGET COVERS
          </span>

          <div className="scope-items">
            <span>TRAVEL</span>
            <i>•</i>

            <span>CAMPSITES</span>
            <i>•</i>

            <span>FOOD</span>
            <i>•</i>

            <span>PERMITS</span>
            <i>•</i>

            <span>ACTIVITIES</span>
            <i>•</i>

            <span>GEAR GAPS</span>
          </div>
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
            ACTIONS
        ===================================================== */}

        <div className="actions">
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
            onClick={continueWithoutBudget}
          >
            I DON&apos;T KNOW YET
          </button>
        </div>

        {/* =====================================================
            NOTE
        ===================================================== */}

        <div className="budget-note">
          <span className="note-index">
            01
          </span>

          <div>
            <strong>
              ALREADY OWN IT?
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
           PAGE
        ===================================================== */

        .budget-page {
          position: relative;

          width: 100%;
          height: 100vh;

          min-height: 720px;

          overflow: hidden;

          background: #080604;

          color: #f1ede4;

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

        .budget-bg {
          position: absolute;
          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;
          object-position: center;

          pointer-events: none;
          user-select: none;
        }

        .scene-shade {
          position: absolute;
          inset: 0;

          pointer-events: none;

          background:
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.55)
                0%,
              rgba(0, 0, 0, 0.05)
                14%,
              transparent
                42%,
              rgba(0, 0, 0, 0.04)
                70%,
              rgba(0, 0, 0, 0.24)
                100%
            ),
            linear-gradient(
              90deg,
              transparent 50%,
              rgba(0, 0, 0, 0.03)
                63%,
              rgba(0, 0, 0, 0.12)
                100%
            );
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .roamlab-header {
          position: absolute;

          z-index: 50;

          top: 0;
          left: 0;
          right: 0;

          height: 78px;

          padding:
            0 26px;

          display: flex;
          align-items: center;

          background:
            linear-gradient(
              180deg,
              rgba(4, 4, 3, 0.92)
                0%,
              rgba(4, 4, 3, 0.74)
                72%,
              rgba(4, 4, 3, 0)
                100%
            );
        }

        /* GLOBAL LINK RESET */

        :global(.roamlab-header a),
        :global(.roamlab-header a:link),
        :global(.roamlab-header a:visited),
        :global(.roamlab-header a:active),
        :global(.change-way),
        :global(.change-way:link),
        :global(.change-way:visited),
        :global(.change-way:active) {
          text-decoration: none !important;
        }

        /* =====================================================
           BRAND
        ===================================================== */

        :global(.brand) {
          flex-shrink: 0;

          display: flex;
          align-items: center;

          gap: 11px;

          margin-right: 52px;
        }

        .brand-mark {
          position: relative;

          width: 35px;
          height: 35px;

          display: grid;
          place-items: center;

          border:
            1.5px solid
            rgba(244, 241, 232, 0.9);

          border-radius: 50%;

          color: #f4f1e8;
        }

        .brand-mark::before,
        .brand-mark::after {
          content: "";

          position: absolute;

          background:
            rgba(244, 241, 232, 0.75);
        }

        .brand-mark::before {
          width: 1px;
          height: 43px;
        }

        .brand-mark::after {
          width: 43px;
          height: 1px;
        }

        .brand-mountain {
          font-size: 12px;
          transform:
            translateY(-1px);
        }

        .brand-name {
          color: #f2eee5;

          font-size: 20px;
          font-weight: 800;

          letter-spacing: 0.14em;
        }

        /* =====================================================
           MAIN NAV
        ===================================================== */

        .main-nav {
          display: flex;
          align-items: center;

          gap: 32px;
        }

        :global(.main-nav a),
        :global(.main-nav a:link),
        :global(.main-nav a:visited),
        :global(.main-nav a:active) {
          color:
            rgba(
              245,
              242,
              234,
              0.86
            ) !important;

          font-size: 10px;
          font-weight: 700;

          letter-spacing: 0.06em;

          transition:
            color 150ms ease;
        }

        :global(.main-nav a:hover) {
          color: #f2a20b !important;
        }

        /* =====================================================
           HEADER ACTIONS
        ===================================================== */

        .header-actions {
          margin-left: auto;

          display: flex;
          align-items: center;

          gap: 16px;
        }

        :global(.signin-button),
        :global(.signin-button:link),
        :global(.signin-button:visited) {
          height: 43px;

          padding:
            0 18px;

          display: flex;
          align-items: center;

          gap: 8px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.58
            );

          background:
            rgba(
              8,
              8,
              7,
              0.6
            );

          color: #f3efe6 !important;

          font-size: 10px;
          font-weight: 700;

          letter-spacing: 0.06em;
        }

        .signin-icon {
          font-size: 14px;
        }

        :global(.start-button),
        :global(.start-button:link),
        :global(.start-button:visited) {
          height: 43px;

          min-width: 172px;

          padding:
            0 18px;

          display: flex;
          align-items: center;
          justify-content:
            space-between;

          gap: 20px;

          background: #f2a20b;

          border:
            1px solid
            rgba(
              255,
              181,
              35,
              0.92
            );

          color: #17120a !important;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.04em;

          box-shadow:
            0 4px 18px
            rgba(
              0,
              0,
              0,
              0.18
            );

          transition:
            background 150ms ease,
            transform 150ms ease;
        }

        :global(.start-button:hover) {
          background: #ffae16;

          transform:
            translateY(-1px);
        }

        /* =====================================================
           BUDGET WORKSPACE
        ===================================================== */

        .budget-workspace {
          position: absolute;

          z-index: 20;

          /*
           * Positioned directly over
           * the leather planning pad.
           */

          left: 65.8%;
          top: 52%;

          width:
            min(
              505px,
              32vw
            );

          transform:
            translateY(-50%);

          text-align: left;

          color: #f0eadf;

          text-shadow:
            0 2px 12px
            rgba(0, 0, 0, 0.75);
        }

        /* =====================================================
           WAY LABEL
        ===================================================== */

        .way-label {
          display: flex;
          align-items: center;

          gap: 10px;

          margin-bottom: 13px;

          color: #f2a20b;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 0.18em;
        }

        .way-line {
          width: 29px;
          height: 2px;

          background: #f2a20b;
        }

        .way-dot {
          color:
            rgba(
              242,
              162,
              11,
              0.5
            );
        }

        /* =====================================================
           TITLE
        ===================================================== */

        .step-label {
          margin:
            0 0 7px;

          color:
            rgba(
              240,
              234,
              223,
              0.55
            );

          font-size: 7px;
          font-weight: 800;

          letter-spacing: 0.2em;
        }

        h1 {
          margin: 0;

          color: #f2eee5;

          font-family:
            "Arial Narrow",
            "Helvetica Neue",
            Arial,
            sans-serif;

          font-size:
            clamp(
              42px,
              3.55vw,
              58px
            );

          line-height: 0.86;

          font-weight: 900;

          letter-spacing:
            -0.035em;

          text-transform: uppercase;

          text-shadow:
            0 4px 18px
            rgba(0, 0, 0, 0.76);
        }

        .question {
          max-width: 390px;

          margin:
            17px 0 20px;

          color:
            rgba(
              242,
              237,
              226,
              0.72
            );

          font-size: 11px;
          font-weight: 500;

          line-height: 1.5;

          letter-spacing:
            0.01em;
        }

        /* =====================================================
           AMOUNT
        ===================================================== */

        .amount-section {
          width: 100%;
        }

        .amount-row {
          width: 100%;

          display: grid;

          grid-template-columns:
            39px
            minmax(0, 1fr)
            40px;

          align-items: center;
        }

        .dollar {
          color: #f2a20b;

          font-size: 39px;
          font-weight: 800;

          line-height: 1;
        }

        .amount-row input {
          width: 100%;
          min-width: 0;

          padding:
            0 8px 0 0;

          border: 0;
          outline: none;

          background:
            transparent;

          color: #f5f0e7;

          font-family:
            "Arial Narrow",
            "Helvetica Neue",
            Arial,
            sans-serif;

          font-size:
            clamp(
              67px,
              5.7vw,
              92px
            );

          line-height: 0.92;

          font-weight: 800;

          letter-spacing:
            -0.045em;

          text-shadow:
            0 4px 20px
            rgba(0, 0, 0, 0.82);
        }

        .amount-row input::placeholder {
          color:
            rgba(
              244,
              239,
              228,
              0.28
            );
        }

        .usd {
          align-self: center;

          color:
            rgba(
              241,
              234,
              219,
              0.58
            );

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 0.16em;
        }

        .amount-rule {
          width: 100%;
          height: 1px;

          margin-top: 6px;

          background:
            rgba(
              242,
              162,
              11,
              0.55
            );
        }

        /* =====================================================
           PRESETS
        ===================================================== */

        .presets {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(5, 1fr);

          gap: 8px;

          margin-top: 14px;
        }

        .preset {
          height: 37px;

          padding: 0;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.25
            );

          background:
            rgba(
              8,
              8,
              7,
              0.48
            );

          color:
            rgba(
              244,
              239,
              229,
              0.72
            );

          cursor: pointer;

          font-size: 8px;
          font-weight: 800;

          letter-spacing:
            0.035em;

          transition:
            border-color 150ms ease,
            color 150ms ease,
            background 150ms ease;
        }

        .preset:hover {
          border-color:
            rgba(
              242,
              162,
              11,
              0.78
            );

          color: #ffffff;

          background:
            rgba(
              20,
              15,
              9,
              0.7
            );
        }

        .preset.selected {
          border-color: #f2a20b;

          background:
            rgba(
              242,
              162,
              11,
              0.16
            );

          color: #f2a20b;
        }

        /* =====================================================
           COST SCOPE
        ===================================================== */

        .cost-scope {
          margin-top: 15px;
        }

        .scope-title {
          display: block;

          margin-bottom: 6px;

          color:
            rgba(
              242,
              162,
              11,
              0.78
            );

          font-size: 6px;
          font-weight: 800;

          letter-spacing:
            0.16em;
        }

        .scope-items {
          display: flex;
          flex-wrap: wrap;

          align-items: center;

          gap: 5px;

          color:
            rgba(
              241,
              235,
              223,
              0.52
            );

          font-size: 6px;
          font-weight: 700;

          line-height: 1.5;

          letter-spacing:
            0.045em;
        }

        .scope-items i {
          color:
            rgba(
              242,
              162,
              11,
              0.55
            );

          font-style: normal;
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .budget-error {
          margin:
            10px 0 0;

          color: #ffc08e;

          font-size: 8px;

          line-height: 1.4;
        }

        /* =====================================================
           ACTIONS
        ===================================================== */

        .actions {
          margin-top: 24px;

          display: flex;
          align-items: center;

          gap: 22px;
        }

        .continue-button {
          width: 195px;
          height: 48px;

          padding:
            0 18px;

          display: flex;
          align-items: center;
          justify-content:
            space-between;

          border:
            1px solid
            rgba(
              255,
              180,
              28,
              0.95
            );

          background: #f2a20b;

          color: #171109;

          cursor: pointer;

          font-family:
            "Arial Narrow",
            "Helvetica Neue",
            Arial,
            sans-serif;

          font-size: 9px;
          font-weight: 900;

          letter-spacing:
            0.1em;

          text-shadow: none;

          box-shadow:
            0 6px 18px
            rgba(
              0,
              0,
              0,
              0.22
            );

          transition:
            background 150ms ease,
            transform 150ms ease;
        }

        .continue-button:hover {
          background: #ffae17;

          transform:
            translateY(-1px);
        }

        .continue-arrow {
          font-size: 18px;
          font-weight: 500;
        }

        .unknown-button {
          padding:
            7px 0;

          border: 0;
          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.25
            );

          background:
            transparent;

          color:
            rgba(
              244,
              239,
              229,
              0.72
            );

          cursor: pointer;

          font-size: 8px;
          font-weight: 800;

          letter-spacing:
            0.1em;

          text-shadow:
            0 2px 8px
            rgba(0, 0, 0, 0.7);

          transition:
            color 150ms ease,
            border-color 150ms ease;
        }

        .unknown-button:hover {
          color: #f2a20b;

          border-color:
            rgba(
              242,
              162,
              11,
              0.7
            );
        }

        /* =====================================================
           NOTE
        ===================================================== */

        .budget-note {
          margin-top: 19px;

          padding-top: 13px;

          display: grid;

          grid-template-columns:
            25px 1fr;

          gap: 10px;

          border-top:
            1px solid
            rgba(
              255,
              255,
              255,
              0.16
            );
        }

        .note-index {
          color: #f2a20b;

          font-size: 7px;
          font-weight: 800;

          letter-spacing:
            0.1em;
        }

        .budget-note strong {
          display: block;

          margin-bottom: 3px;

          color:
            rgba(
              244,
              239,
              229,
              0.75
            );

          font-size: 7px;
          font-weight: 800;

          letter-spacing:
            0.11em;
        }

        .budget-note p {
          margin: 0;

          color:
            rgba(
              239,
              233,
              220,
              0.48
            );

          font-size: 7px;

          line-height: 1.5;
        }

        /* =====================================================
           CHANGE WAY
        ===================================================== */

        :global(.change-way),
        :global(.change-way:link),
        :global(.change-way:visited),
        :global(.change-way:active) {
          display: inline-block;

          margin-top: 14px;

          color:
            rgba(
              244,
              239,
              229,
              0.58
            ) !important;

          text-decoration:
            none !important;

          font-size: 7px;
          font-weight: 800;

          letter-spacing:
            0.11em;

          transition:
            color 150ms ease;
        }

        :global(.change-way:hover) {
          color: #f2a20b !important;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1180px) {
          .main-nav {
            gap: 19px;
          }

          :global(.main-nav a) {
            font-size: 8px;
          }

          .budget-workspace {
            left: 62%;

            width: 35vw;
          }

          .amount-row input {
            font-size: 68px;
          }
        }

        @media (max-width: 980px) {
          .main-nav {
            display: none;
          }

          .budget-workspace {
            left: 58%;

            width: 39vw;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 760px) {
          .budget-page {
            min-height: 800px;

            overflow-y: auto;
          }

          .budget-bg {
            position: fixed;

            object-position:
              58% center;
          }

          .scene-shade {
            position: fixed;

            background:
              rgba(
                5,
                4,
                3,
                0.58
              );
          }

          .roamlab-header {
            position: fixed;

            height: 66px;

            padding:
              0 17px;
          }

          :global(.brand) {
            margin-right: 0;
          }

          .brand-mark {
            width: 30px;
            height: 30px;
          }

          .brand-name {
            font-size: 15px;
          }

          :global(.signin-button) {
            display: none;
          }

          :global(.start-button) {
            min-width: 0;

            height: 36px;

            padding:
              0 11px;

            font-size: 7px;
          }

          .budget-workspace {
            position: relative;

            left: auto;
            top: auto;

            width:
              calc(
                100% - 36px
              );

            max-width: 470px;

            margin:
              105px auto 50px;

            padding:
              28px 24px;

            transform: none;

            background:
              rgba(
                10,
                8,
                6,
                0.8
              );

            border:
              1px solid
              rgba(
                255,
                255,
                255,
                0.22
              );

            backdrop-filter:
              blur(8px);
          }

          h1 {
            font-size: 43px;
          }

          .amount-row input {
            font-size: 60px;
          }

          .actions {
            flex-direction: column;

            align-items: stretch;

            gap: 14px;
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
