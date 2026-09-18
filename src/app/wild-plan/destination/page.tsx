"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentWild,
  getOrCreateCurrentWild,
  updateWildDestination,
} from "@/lib/wildStore";

export default function WildDestinationPage() {
  const router = useRouter();

  const [destination, setDestination] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const wild = getCurrentWild();
    const currentDestination =
      wild?.plan.adventure.destination;

    if (currentDestination) {
      setDestination(currentDestination.name || "");
      setRegion(currentDestination.region || "");
      setCountry(currentDestination.country || "");
    }

    setLoaded(true);
  }, []);

  function saveDestination(event: FormEvent) {
    event.preventDefault();

    const name = destination.trim();

    if (!name) return;

    getOrCreateCurrentWild("My Wild");

    updateWildDestination({
      name,
      region: region.trim() || undefined,
      country: country.trim() || undefined,
    });

    router.push("/wild-plan");
  }

  if (!loaded) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#0d0e0b",
        }}
      />
    );
  }

  return (
    <main className="destinationPage">
      <div
        className="destinationBackground"
        aria-hidden="true"
      />

      <header className="destinationHeader">
        <button
          type="button"
          className="brand"
          onClick={() => router.push("/")}
        >
          ROAMLAB
        </button>

        <button
          type="button"
          className="backToPlan"
          onClick={() => router.push("/wild-plan")}
        >
          ← YOUR WILD PLAN
        </button>
      </header>

      <section className="destinationStage">
        <div className="destinationCompass">
          <span>◆</span>
        </div>

        <p className="eyebrow">
          YOUR WILD · DESTINATION
        </p>

        <h1>
          Where do you
          <br />
          want to go?
        </h1>

        <p className="intro">
          Give your Wild a place to begin.
          You can refine the route, conditions,
          camps and stops later.
        </p>

        <form
          className="destinationForm"
          onSubmit={saveDestination}
        >
          <label className="primaryField">
            <span>DESTINATION</span>

            <input
              type="text"
              value={destination}
              onChange={(event) =>
                setDestination(event.target.value)
              }
              placeholder="Yosemite National Park"
              autoFocus
              autoComplete="off"
            />
          </label>

          <div className="secondaryFields">
            <label>
              <span>REGION · OPTIONAL</span>

              <input
                type="text"
                value={region}
                onChange={(event) =>
                  setRegion(event.target.value)
                }
                placeholder="California"
                autoComplete="off"
              />
            </label>

            <label>
              <span>COUNTRY · OPTIONAL</span>

              <input
                type="text"
                value={country}
                onChange={(event) =>
                  setCountry(event.target.value)
                }
                placeholder="United States"
                autoComplete="off"
              />
            </label>
          </div>

          <div className="destinationHint">
            <span>START SIMPLE</span>

            <p>
              A park, region, trail area,
              coastline, forest or general
              destination is enough for now.
            </p>
          </div>

          <div className="actions">
            <button
              type="button"
              className="secondaryAction"
              onClick={() =>
                router.push("/wild-plan")
              }
            >
              NOT YET
            </button>

            <button
              type="submit"
              className="primaryAction"
              disabled={!destination.trim()}
            >
              SAVE TO MY WILD →
            </button>
          </div>
        </form>
      </section>

      <footer className="destinationFooter">
        <span>GO WILD.</span>
        <span className="footerLine" />
        <span>SHOW IT.</span>
      </footer>

      <style jsx>{`
        .destinationPage {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          padding: 0 56px 50px;
          background:
            radial-gradient(
              circle at 50% 30%,
              rgba(151, 119, 69, 0.14),
              transparent 36%
            ),
            linear-gradient(
              180deg,
              #171611 0%,
              #0d0e0b 58%,
              #090a08 100%
            );
          color: #f2eee4;
        }

        .destinationBackground {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.2;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.018) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.018) 1px,
              transparent 1px
            );
          background-size: 48px 48px;
        }

        button,
        input {
          font: inherit;
        }

        .destinationHeader {
          position: relative;
          z-index: 5;
          height: 92px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom:
            1px solid rgba(255, 255, 255, 0.1);
        }

        .brand,
        .backToPlan {
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .brand {
          color: #f4f0e7;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .backToPlan {
          color: rgba(242, 238, 228, 0.58);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }

        .backToPlan:hover {
          color: #d1ad70;
        }

        .destinationStage {
          position: relative;
          z-index: 2;
          width: min(780px, 100%);
          margin: 64px auto 0;
        }

        .destinationCompass {
          width: 54px;
          height: 54px;
          margin-bottom: 30px;
          display: grid;
          place-items: center;
          border:
            1px solid rgba(212, 178, 117, 0.55);
          border-radius: 50%;
          box-shadow:
            0 0 0 8px
              rgba(212, 178, 117, 0.025),
            0 0 40px
              rgba(212, 178, 117, 0.08);
        }

        .destinationCompass span {
          color: #c8a66c;
          font-size: 21px;
          transform: rotate(45deg);
        }

        .eyebrow {
          margin: 0 0 16px;
          color: #b89966;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.24em;
        }

        h1 {
          margin: 0;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(48px, 6vw, 76px);
          line-height: 0.98;
          font-weight: 400;
          letter-spacing: -0.035em;
        }

        .intro {
          max-width: 560px;
          margin: 24px 0 46px;
          color: rgba(242, 238, 228, 0.55);
          font-size: 14px;
          line-height: 1.75;
        }

        .destinationForm {
          border-top:
            1px solid rgba(255, 255, 255, 0.12);
          padding-top: 32px;
        }

        label {
          display: block;
        }

        label > span {
          display: block;
          margin-bottom: 11px;
          color: rgba(242, 238, 228, 0.4);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.2em;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          border: 0;
          border-bottom:
            1px solid rgba(201, 166, 107, 0.32);
          outline: 0;
          border-radius: 0;
          background: transparent;
          color: #f2eee4;
        }

        .primaryField input {
          padding: 8px 0 18px;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 400;
        }

        input::placeholder {
          color: rgba(242, 238, 228, 0.18);
        }

        input:focus {
          border-bottom-color:
            rgba(209, 173, 112, 0.8);
        }

        .secondaryFields {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 34px;
          margin-top: 38px;
        }

        .secondaryFields input {
          padding: 7px 0 13px;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 17px;
        }

        .destinationHint {
          margin-top: 38px;
          padding: 20px 0;
          display: flex;
          align-items: flex-start;
          gap: 26px;
          border-top:
            1px solid rgba(255, 255, 255, 0.07);
          border-bottom:
            1px solid rgba(255, 255, 255, 0.07);
        }

        .destinationHint span {
          flex: 0 0 auto;
          color: #a98a58;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .destinationHint p {
          margin: 0;
          color: rgba(242, 238, 228, 0.42);
          font-size: 11px;
          line-height: 1.65;
        }

        .actions {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
        }

        .secondaryAction,
        .primaryAction {
          min-height: 46px;
          padding: 0 20px;
          cursor: pointer;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }

        .secondaryAction {
          border: 0;
          background: transparent;
          color: rgba(242, 238, 228, 0.42);
        }

        .secondaryAction:hover {
          color: #f2eee4;
        }

        .primaryAction {
          border:
            1px solid rgba(201, 166, 107, 0.5);
          background:
            rgba(201, 166, 107, 0.08);
          color: #d1ad70;
        }

        .primaryAction:hover:not(:disabled) {
          border-color:
            rgba(209, 173, 112, 0.85);
          background:
            rgba(201, 166, 107, 0.13);
        }

        .primaryAction:disabled {
          opacity: 0.3;
          cursor: default;
        }

        .destinationFooter {
          position: relative;
          z-index: 2;
          width: min(780px, 100%);
          margin: 68px auto 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          color: rgba(242, 238, 228, 0.26);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.22em;
        }

        .footerLine {
          width: 48px;
          height: 1px;
          background:
            rgba(242, 238, 228, 0.14);
        }

        @media (max-width: 700px) {
          .destinationPage {
            padding-left: 20px;
            padding-right: 20px;
          }

          .destinationHeader {
            height: 76px;
          }

          .destinationStage {
            margin-top: 46px;
          }

          .secondaryFields {
            grid-template-columns: 1fr;
          }

          .actions {
            align-items: stretch;
            flex-direction: column-reverse;
          }

          .primaryAction,
          .secondaryAction {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
