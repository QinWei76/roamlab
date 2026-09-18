"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getOrCreateCurrentWild,
  updateWildRoute,
} from "@/lib/wildStore";

import type {
  WildRoute,
  WildRoutePoint,
} from "@/types/wild";

function makePoint(
  name: string,
  type: WildRoutePoint["type"]
): WildRoutePoint {
  return {
    id: `${type}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    name,
    type,
  };
}

export default function WildRoutePage() {
  const router = useRouter();

  const [destination, setDestination] = useState("");
  const [startingFrom, setStartingFrom] = useState("");
  const [routeStops, setRouteStops] = useState("");
  const [campBase, setCampBase] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [notes, setNotes] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wild = getOrCreateCurrentWild("My Wild");
    const route = wild.plan.route;

    setDestination(
      wild.plan.adventure.destination?.name || "Not set"
    );

    const start = route?.points?.find(
      (point) => point.type === "start"
    );
    const camp = route?.points?.find(
      (point) => point.type === "camp"
    );
    const stops =
      route?.points
        ?.filter((point) => point.type === "stop")
        .map((point) => point.name)
        .join(", ") || "";

    setStartingFrom(start?.name || "");
    setCampBase(camp?.name || "");
    setRouteStops(stops);

    setDistanceKm(
      typeof route?.distanceKm === "number"
        ? String(route.distanceKm)
        : ""
    );

    setNotes(route?.notes || "");
    setReady(true);
  }, []);

  const destinationDisplay = useMemo(
    () => destination || "Not set",
    [destination]
  );

  function saveRoute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const points: WildRoutePoint[] = [];

    const startName = startingFrom.trim();
    if (startName) {
      points.push(makePoint(startName, "start"));
    }

    const stopNames = routeStops
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    stopNames.forEach((name) => {
      points.push(makePoint(name, "stop"));
    });

    const campName = campBase.trim();
    if (campName) {
      points.push(makePoint(campName, "camp"));
    }

    if (destination && destination !== "Not set") {
      points.push(makePoint(destination, "finish"));
    }

    const parsedDistance = Number(distanceKm);
    const validDistance =
      distanceKm.trim() !== "" &&
      Number.isFinite(parsedDistance) &&
      parsedDistance >= 0
        ? parsedDistance
        : undefined;

    const route: WildRoute = {
      name:
        startName &&
        destination &&
        destination !== "Not set"
          ? `${startName} → ${destination}`
          : destination !== "Not set"
          ? `Route to ${destination}`
          : startName
          ? `Route from ${startName}`
          : undefined,
      distanceKm: validDistance,
      points: points.length ? points : undefined,
      notes: notes.trim() || undefined,
    };

    updateWildRoute(route);
    router.push("/wild-plan");
  }

  function notYet() {
    router.push("/wild-plan");
  }

  if (!ready) {
    return (
      <main className="routePage routeLoading">
        <div className="loadingText">OPENING YOUR WILD...</div>

        <style jsx>{`
          .routePage {
            min-height: 100vh;
            background:
              radial-gradient(
                circle at 50% 15%,
                rgba(137, 108, 66, 0.1),
                transparent 32%
              ),
              #090908;
            color: #e7dfd1;
          }

          .routeLoading {
            display: grid;
            place-items: center;
          }

          .loadingText {
            font-size: 11px;
            letter-spacing: 0.22em;
            color: #817868;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="routePage">
      <header className="topbar">
        <button
          type="button"
          className="logo"
          onClick={() => router.push("/")}
        >
          ROAMLAB
        </button>

        <button
          type="button"
          className="backLink"
          onClick={() => router.push("/wild-plan")}
        >
          ← YOUR WILD PLAN
        </button>
      </header>

      <section className="routeStage">
        <div className="routeIntro">
          <div className="compass" aria-hidden="true">
            <span className="north">N</span>
            <span className="needle" />
            <span className="compassDot" />
          </div>

          <p className="eyebrow">YOUR WILD · ROUTE</p>

          <h1>Build the path.</h1>

          <p className="introText">
            Start with what you know. Your route can stay
            flexible and grow as the Wild takes shape.
          </p>
        </div>

        <form className="routeForm" onSubmit={saveRoute}>
          <div className="destinationCard">
            <div>
              <span className="fieldLabel">DESTINATION</span>
              <strong>{destinationDisplay}</strong>
            </div>

            <button
              type="button"
              className="editDestination"
              onClick={() =>
                router.push("/wild-plan/destination")
              }
            >
              EDIT
            </button>
          </div>

          <label className="field">
            <span className="fieldLabel">
              STARTING FROM
            </span>

            <input
              value={startingFrom}
              onChange={(event) =>
                setStartingFrom(event.target.value)
              }
              placeholder="e.g. San Francisco"
              autoComplete="off"
            />
          </label>

          <label className="field">
            <span className="fieldLabel">
              ROUTE STOPS
            </span>

            <input
              value={routeStops}
              onChange={(event) =>
                setRouteStops(event.target.value)
              }
              placeholder="Add stops, separated by commas"
              autoComplete="off"
            />

            <small>
              Optional · You can leave the exact route open.
            </small>
          </label>

          <label className="field">
            <span className="fieldLabel">
              CAMP / BASE
            </span>

            <input
              value={campBase}
              onChange={(event) =>
                setCampBase(event.target.value)
              }
              placeholder="Where will you stay?"
              autoComplete="off"
            />
          </label>

          <label className="field">
            <span className="fieldLabel">
              ESTIMATED DISTANCE
            </span>

            <div className="distanceInput">
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={distanceKm}
                onChange={(event) =>
                  setDistanceKm(event.target.value)
                }
                placeholder="0"
              />
              <span>KM</span>
            </div>

            <small>
              Optional · A rough estimate is enough for now.
            </small>
          </label>

          <label className="field">
            <span className="fieldLabel">ROUTE NOTES</span>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Road access, preferred roads, arrival notes..."
              rows={3}
            />
          </label>

          <div className="actions">
            <button
              type="button"
              className="notYet"
              onClick={notYet}
            >
              NOT YET
            </button>

            <button type="submit" className="saveButton">
              SAVE TO MY WILD →
            </button>
          </div>

          <p className="footnote">
            Nothing here is a hard gate. Save what you know
            now and refine the route later.
          </p>
        </form>
      </section>

      <style jsx>{`
        .routePage {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 50% 8%,
              rgba(137, 108, 66, 0.11),
              transparent 28%
            ),
            linear-gradient(
              180deg,
              #0c0c0b 0%,
              #090908 100%
            );
          color: #e7dfd1;
          font-family:
            Arial, Helvetica, sans-serif;
        }

        .topbar {
          height: 74px;
          padding: 0 42px;
          border-bottom: 1px solid
            rgba(218, 203, 176, 0.12);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo,
        .backLink,
        .editDestination,
        .notYet,
        .saveButton {
          font: inherit;
        }

        .logo {
          border: 0;
          padding: 10px 0;
          background: transparent;
          color: #f0eadf;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.16em;
          cursor: pointer;
        }

        .backLink {
          border: 0;
          padding: 10px 0;
          background: transparent;
          color: #8f8678;
          font-size: 10px;
          letter-spacing: 0.18em;
          cursor: pointer;
          transition: color 160ms ease;
        }

        .backLink:hover {
          color: #c8a96f;
        }

        .routeStage {
          width: min(760px, calc(100% - 48px));
          margin: 0 auto;
          padding: 72px 0 96px;
        }

        .routeIntro {
          text-align: center;
          margin-bottom: 50px;
        }

        .compass {
          width: 58px;
          height: 58px;
          margin: 0 auto 25px;
          border: 1px solid
            rgba(199, 169, 111, 0.42);
          border-radius: 50%;
          position: relative;
        }

        .compass::before,
        .compass::after {
          content: "";
          position: absolute;
          background: rgba(199, 169, 111, 0.22);
        }

        .compass::before {
          width: 1px;
          height: 42px;
          left: 28px;
          top: 8px;
        }

        .compass::after {
          height: 1px;
          width: 42px;
          top: 28px;
          left: 8px;
        }

        .north {
          position: absolute;
          top: -17px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          letter-spacing: 0.14em;
          color: #9b8d77;
        }

        .needle {
          position: absolute;
          width: 1px;
          height: 22px;
          left: 28px;
          top: 8px;
          background: #c8a96f;
          transform: rotate(27deg);
          transform-origin: 50% 21px;
          z-index: 2;
        }

        .compassDot {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          left: 26px;
          top: 26px;
          background: #c8a96f;
          z-index: 3;
        }

        .eyebrow,
        .fieldLabel {
          margin: 0;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.21em;
          color: #8d816e;
        }

        h1 {
          margin: 13px 0 15px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(42px, 7vw, 68px);
          font-weight: 400;
          line-height: 0.98;
          letter-spacing: -0.035em;
          color: #eee7da;
        }

        .introText {
          max-width: 510px;
          margin: 0 auto;
          color: #8f887d;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 15px;
          line-height: 1.65;
        }

        .routeForm {
          border-top: 1px solid
            rgba(218, 203, 176, 0.14);
        }

        .destinationCard {
          min-height: 92px;
          padding: 20px 0;
          border-bottom: 1px solid
            rgba(218, 203, 176, 0.14);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .destinationCard strong {
          display: block;
          margin-top: 9px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 20px;
          font-weight: 400;
          color: #d9c8a7;
        }

        .editDestination {
          border: 0;
          background: transparent;
          color: #8e816d;
          font-size: 9px;
          letter-spacing: 0.18em;
          cursor: pointer;
        }

        .editDestination:hover {
          color: #c8a96f;
        }

        .field {
          display: block;
          padding: 24px 0 20px;
          border-bottom: 1px solid
            rgba(218, 203, 176, 0.12);
        }

        .field input,
        .field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 0;
          outline: none;
          background: transparent;
          color: #eee7da;
          font: inherit;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 20px;
          line-height: 1.4;
        }

        .field input {
          margin-top: 11px;
          padding: 6px 0 7px;
        }

        .field textarea {
          margin-top: 13px;
          padding: 4px 0;
          resize: vertical;
        }

        .field input::placeholder,
        .field textarea::placeholder {
          color: #57534c;
        }

        .field small {
          display: block;
          margin-top: 7px;
          color: #615d55;
          font-size: 10px;
          letter-spacing: 0.035em;
        }

        .distanceInput {
          display: flex;
          align-items: baseline;
          gap: 14px;
        }

        .distanceInput input {
          flex: 1;
          min-width: 0;
        }

        .distanceInput span {
          color: #786f61;
          font-size: 9px;
          letter-spacing: 0.18em;
        }

        .actions {
          padding-top: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
        }

        .notYet {
          min-height: 46px;
          padding: 0 6px;
          border: 0;
          background: transparent;
          color: #756e63;
          font-size: 9px;
          letter-spacing: 0.18em;
          cursor: pointer;
        }

        .notYet:hover {
          color: #aaa092;
        }

        .saveButton {
          min-height: 50px;
          padding: 0 26px;
          border: 1px solid
            rgba(199, 169, 111, 0.52);
          background: rgba(199, 169, 111, 0.07);
          color: #d5b77e;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          cursor: pointer;
          transition:
            background 160ms ease,
            border-color 160ms ease,
            color 160ms ease;
        }

        .saveButton:hover {
          border-color: rgba(199, 169, 111, 0.82);
          background: rgba(199, 169, 111, 0.12);
          color: #ead4aa;
        }

        .footnote {
          margin: 19px 0 0;
          color: #57534d;
          font-size: 9px;
          line-height: 1.6;
          letter-spacing: 0.045em;
          text-align: right;
        }

        @media (max-width: 640px) {
          .topbar {
            height: 66px;
            padding: 0 20px;
          }

          .routeStage {
            width: min(100% - 36px, 760px);
            padding: 58px 0 72px;
          }

          .routeIntro {
            margin-bottom: 38px;
          }

          .destinationCard {
            align-items: flex-end;
          }

          .actions {
            align-items: stretch;
            flex-direction: column-reverse;
          }

          .notYet,
          .saveButton {
            width: 100%;
          }

          .footnote {
            text-align: center;
          }
        }
      `}</style>
    </main>
  );
}
