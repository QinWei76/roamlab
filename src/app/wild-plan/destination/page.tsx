"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentWild,
  getOrCreateCurrentWild,
  updateWildDestination,
  updateWildIntent,
} from "@/lib/wildStore";

type DestinationMode =
  | "choose"
  | "known"
  | "discover";

type DiscoveryMatch = {
  source: string;
  sourceId: string;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  activities?: string[];
  distanceKm?: number;
  matchScore?: number;
  matchReasons?: string[];
  whyItFits?: string;
};

type DiscoveryResponse = {
  success: boolean;
  candidateCount?: number;
  matches?: DiscoveryMatch[];
  error?: string;
};

export default function WildDestinationPage() {
  const router = useRouter();

  const [mode, setMode] =
    useState<DestinationMode>("choose");

  const [destination, setDestination] =
    useState("");

  const [region, setRegion] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [loaded, setLoaded] =
    useState(false);

  const [discovering, setDiscovering] =
    useState(false);

  const [matches, setMatches] =
    useState<DiscoveryMatch[]>([]);

  const [discoveryError, setDiscoveryError] =
    useState("");

  useEffect(() => {
    const wild = getCurrentWild();

    const currentDestination =
      wild?.plan.adventure.destination;

    if (currentDestination) {
      setDestination(
        currentDestination.name || ""
      );

      setRegion(
        currentDestination.region || ""
      );

      setCountry(
        currentDestination.country || ""
      );
    }

    setLoaded(true);
  }, []);

  function saveKnownDestination(
    event: FormEvent
  ) {
    event.preventDefault();

    const name = destination.trim();

    if (!name) return;

    getOrCreateCurrentWild("My Wild");

    updateWildIntent({
      destinationMode: "known",
    });

    updateWildDestination({
      name,
      region:
        region.trim() || undefined,
      country:
        country.trim() || undefined,
    });

    router.push("/wild-plan");
  }

  async function discoverDestinations() {
    const wild = getCurrentWild();

    if (!wild) {
      setDiscoveryError(
        "Start your Wild first, then come back to discover a destination."
      );

      return;
    }

    const intent =
      wild.plan.adventure.intent;

    const schedule =
      wild.plan.adventure.schedule;

    if (!intent) {
      setDiscoveryError(
        "Your Wild needs a little more direction before we can find the right places."
      );

      return;
    }

    setDiscovering(true);
    setDiscoveryError("");
    setMatches([]);

    try {
      updateWildIntent({
        destinationMode: "discover",
      });

      const latestWild =
        getCurrentWild();

      const latestIntent =
        latestWild?.plan.adventure.intent ??
        intent;

      const response = await fetch(
        "/api/destination-discovery",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            intent: latestIntent,
            schedule,
          }),
        }
      );

      const data =
        (await response.json()) as
          DiscoveryResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Destination discovery failed."
        );
      }

      const nextMatches =
        data.matches ?? [];

      setMatches(nextMatches);

      if (nextMatches.length === 0) {
        setDiscoveryError(
          "No strong matches surfaced yet. Try adjusting your Wild preferences."
        );
      }
    } catch (error) {
      console.error(
        "RoamLab destination discovery failed:",
        error
      );

      setDiscoveryError(
        error instanceof Error
          ? error.message
          : "We couldn't discover destinations right now."
      );
    } finally {
      setDiscovering(false);
    }
  }

  function selectDiscoveredDestination(
    match: DiscoveryMatch
  ) {
    getOrCreateCurrentWild("My Wild");

    updateWildIntent({
      destinationMode: "discover",
    });

    updateWildDestination({
      name: match.name,

      coordinates:
        typeof match.latitude ===
          "number" &&
        typeof match.longitude ===
          "number"
          ? {
              latitude:
                match.latitude,
              longitude:
                match.longitude,
            }
          : undefined,

      notes:
        match.whyItFits ||
        undefined,
    });

    router.push("/wild-plan");
  }

  function resetChoice() {
    setMode("choose");
    setDiscoveryError("");
    setMatches([]);
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
          onClick={() =>
            router.push("/")
          }
        >
          ROAMLAB
        </button>

        <button
          type="button"
          className="backToPlan"
          onClick={() =>
            router.push("/wild-plan")
          }
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

        {mode === "choose" && (
          <>
            <h1>
              Where do you
              <br />
              want to go?
            </h1>

            <p className="intro">
              Bring a place you already
              have in mind, or let RoamLab
              find landscapes that fit the
              Wild you are building.
            </p>

            <div className="choiceGrid">
              <button
                type="button"
                className="choiceCard"
                onClick={() =>
                  setMode("known")
                }
              >
                <div className="choiceNumber">
                  01
                </div>

                <div className="choiceContent">
                  <span className="choiceLabel">
                    I KNOW WHERE
                  </span>

                  <h2>
                    I have a place
                    <br />
                    in mind.
                  </h2>

                  <p>
                    Add a park, region,
                    trail area, forest,
                    coastline or another
                    destination you already
                    know.
                  </p>

                  <span className="choiceAction">
                    ENTER DESTINATION →
                  </span>
                </div>
              </button>

              <button
                type="button"
                className="choiceCard featured"
                onClick={() => {
                  setMode("discover");
                  void discoverDestinations();
                }}
              >
                <div className="choiceNumber">
                  02
                </div>

                <div className="choiceContent">
                  <span className="choiceLabel">
                    HELP ME DISCOVER
                  </span>

                  <h2>
                    Find a place
                    <br />
                    for my Wild.
                  </h2>

                  <p>
                    Use the activities,
                    landscape and direction
                    already inside your Wild
                    to surface real places.
                  </p>

                  <span className="choiceAction">
                    DISCOVER MY WILD →
                  </span>
                </div>
              </button>
            </div>

            <div className="choiceFootnote">
              <span>START SIMPLE</span>

              <p>
                You can refine routes,
                conditions, camps and stops
                later.
              </p>
            </div>
          </>
        )}

        {mode === "known" && (
          <>
            <button
              type="button"
              className="modeBack"
              onClick={resetChoice}
            >
              ← CHANGE DIRECTION
            </button>

            <h1>
              Name the
              <br />
              place.
            </h1>

            <p className="intro">
              A park, region, trail area,
              coastline, forest or general
              destination is enough for
              now.
            </p>

            <form
              className="destinationForm"
              onSubmit={
                saveKnownDestination
              }
            >
              <label className="primaryField">
                <span>DESTINATION</span>

                <input
                  type="text"
                  value={destination}
                  onChange={(event) =>
                    setDestination(
                      event.target.value
                    )
                  }
                  placeholder="Yosemite National Park"
                  autoFocus
                  autoComplete="off"
                />
              </label>

              <div className="secondaryFields">
                <label>
                  <span>
                    REGION · OPTIONAL
                  </span>

                  <input
                    type="text"
                    value={region}
                    onChange={(event) =>
                      setRegion(
                        event.target.value
                      )
                    }
                    placeholder="California"
                    autoComplete="off"
                  />
                </label>

                <label>
                  <span>
                    COUNTRY · OPTIONAL
                  </span>

                  <input
                    type="text"
                    value={country}
                    onChange={(event) =>
                      setCountry(
                        event.target.value
                      )
                    }
                    placeholder="United States"
                    autoComplete="off"
                  />
                </label>
              </div>

              <div className="destinationHint">
                <span>START SIMPLE</span>

                <p>
                  Save the broad destination
                  now. Route, camps,
                  conditions and stops can
                  become more precise later.
                </p>
              </div>

              <div className="actions">
                <button
                  type="button"
                  className="secondaryAction"
                  onClick={resetChoice}
                >
                  BACK
                </button>

                <button
                  type="submit"
                  className="primaryAction"
                  disabled={
                    !destination.trim()
                  }
                >
                  SAVE TO MY WILD →
                </button>
              </div>
            </form>
          </>
        )}

        {mode === "discover" && (
          <>
            <button
              type="button"
              className="modeBack"
              onClick={resetChoice}
            >
              ← CHANGE DIRECTION
            </button>

            <h1>
              Find your
              <br />
              Wild.
            </h1>

            <p className="intro">
              We are matching the direction
              of your Wild with real
              recreation areas. Choose the
              place that feels like the
              right beginning.
            </p>

            {discovering && (
              <div className="findingPanel">
                <div className="findingMark">
                  <span>◆</span>
                </div>

                <div>
                  <span className="findingLabel">
                    FINDING YOUR WILD
                  </span>

                  <p>
                    Reading your activities
                    and landscape
                    preferences...
                  </p>
                </div>
              </div>
            )}

            {!discovering &&
              discoveryError && (
                <div className="errorPanel">
                  <span>
                    NO CLEAR TRAIL YET
                  </span>

                  <p>
                    {discoveryError}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      void discoverDestinations()
                    }
                  >
                    TRY AGAIN →
                  </button>
                </div>
              )}

            {!discovering &&
              matches.length > 0 && (
                <>
                  <div className="resultsHeader">
                    <span>
                      PLACES FOR THIS WILD
                    </span>

                    <span>
                      {matches.length
                        .toString()
                        .padStart(2, "0")}{" "}
                      MATCHES
                    </span>
                  </div>

                  <div className="resultList">
                    {matches.map(
                      (match, index) => (
                        <article
                          className="resultCard"
                          key={`${match.source}-${match.sourceId}`}
                        >
                          <div className="resultNumber">
                            {(index + 1)
                              .toString()
                              .padStart(
                                2,
                                "0"
                              )}
                          </div>

                          <div className="resultMain">
                            <h2>
                              {match.name}
                            </h2>

                            {match.activities &&
                              match.activities
                                .length >
                                0 && (
                                <div className="activityRow">
                                  {match.activities
                                    .slice(0, 5)
                                    .map(
                                      (
                                        activity
                                      ) => (
                                        <span
                                          key={
                                            activity
                                          }
                                        >
                                          {activity
                                            .replace(
                                              /-/g,
                                              " "
                                            )
                                            .toUpperCase()}
                                        </span>
                                      )
                                    )}
                                </div>
                              )}

                            {match.whyItFits && (
                              <p className="whyFit">
                                {
                                  match.whyItFits
                                }
                              </p>
                            )}

                            {typeof match.distanceKm ===
                              "number" && (
                              <p className="distance">
                                APPROX.{" "}
                                {Math.round(
                                  match.distanceKm
                                ).toLocaleString()}{" "}
                                KM FROM YOUR START
                              </p>
                            )}
                          </div>

                          <div className="resultSelect">
                            <button
                              type="button"
                              onClick={() =>
                                selectDiscoveredDestination(
                                  match
                                )
                              }
                            >
                              CHOOSE
                              <br />
                              THIS WILD
                              <span>→</span>
                            </button>
                          </div>
                        </article>
                      )
                    )}
                  </div>

                  <div className="discoverActions">
                    <button
                      type="button"
                      className="secondaryAction"
                      onClick={() =>
                        void discoverDestinations()
                      }
                    >
                      SEARCH AGAIN
                    </button>

                    <button
                      type="button"
                      className="secondaryAction"
                      onClick={() =>
                        setMode("known")
                      }
                    >
                      ENTER A PLACE INSTEAD
                    </button>
                  </div>
                </>
              )}
          </>
        )}
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
          overflow-x: hidden;
          padding: 0 56px 50px;
          background:
            radial-gradient(
              circle at 50% 24%,
              rgba(151, 119, 69, 0.14),
              transparent 38%
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
              rgba(255, 255, 255, 0.018)
                1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.018)
                1px,
              transparent 1px
            );
          background-size: 48px 48px;
        }

        button,
        input {
          font: inherit;
        }

        button {
          -webkit-tap-highlight-color:
            transparent;
        }

        .destinationHeader {
          position: relative;
          z-index: 5;
          height: 92px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.1);
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
          color: rgba(
            242,
            238,
            228,
            0.58
          );
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }

        .backToPlan:hover,
        .modeBack:hover {
          color: #d1ad70;
        }

        .destinationStage {
          position: relative;
          z-index: 2;
          width: min(980px, 100%);
          margin: 64px auto 0;
        }

        .destinationCompass {
          width: 54px;
          height: 54px;
          margin-bottom: 30px;
          display: grid;
          place-items: center;
          border: 1px solid
            rgba(212, 178, 117, 0.55);
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
          font-size: clamp(
            48px,
            6vw,
            76px
          );
          line-height: 0.98;
          font-weight: 400;
          letter-spacing: -0.035em;
        }

        .intro {
          max-width: 590px;
          margin: 24px 0 46px;
          color: rgba(
            242,
            238,
            228,
            0.55
          );
          font-size: 14px;
          line-height: 1.75;
        }

        .modeBack {
          margin: 0 0 28px;
          padding: 0;
          border: 0;
          background: transparent;
          color: rgba(
            242,
            238,
            228,
            0.4
          );
          cursor: pointer;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .choiceGrid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 18px;
          border-top: 1px solid
            rgba(255, 255, 255, 0.1);
          padding-top: 24px;
        }

        .choiceCard {
          position: relative;
          min-height: 330px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: left;
          border: 1px solid
            rgba(255, 255, 255, 0.1);
          background: rgba(
            255,
            255,
            255,
            0.018
          );
          color: #f2eee4;
          cursor: pointer;
          transition:
            border-color 180ms ease,
            background 180ms ease,
            transform 180ms ease;
        }

        .choiceCard:hover {
          transform: translateY(-2px);
          border-color: rgba(
            201,
            166,
            107,
            0.48
          );
          background: rgba(
            201,
            166,
            107,
            0.045
          );
        }

        .choiceCard.featured {
          border-color: rgba(
            201,
            166,
            107,
            0.28
          );
          background:
            linear-gradient(
              135deg,
              rgba(
                201,
                166,
                107,
                0.07
              ),
              rgba(
                255,
                255,
                255,
                0.012
              )
            );
        }

        .choiceNumber {
          color: rgba(
            209,
            173,
            112,
            0.55
          );
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .choiceLabel {
          display: block;
          margin-bottom: 14px;
          color: #b89966;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.2em;
        }

        .choiceContent h2 {
          margin: 0;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(
            27px,
            3vw,
            38px
          );
          line-height: 1.05;
          font-weight: 400;
        }

        .choiceContent p {
          max-width: 330px;
          min-height: 54px;
          margin: 20px 0 28px;
          color: rgba(
            242,
            238,
            228,
            0.45
          );
          font-size: 11px;
          line-height: 1.7;
        }

        .choiceAction {
          color: #d1ad70;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }

        .choiceFootnote {
          margin-top: 26px;
          padding: 18px 0;
          display: flex;
          align-items: center;
          gap: 24px;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.07);
        }

        .choiceFootnote span {
          flex: 0 0 auto;
          color: #a98a58;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .choiceFootnote p {
          margin: 0;
          color: rgba(
            242,
            238,
            228,
            0.38
          );
          font-size: 11px;
        }

        .destinationForm {
          border-top: 1px solid
            rgba(255, 255, 255, 0.12);
          padding-top: 32px;
        }

        label {
          display: block;
        }

        label > span {
          display: block;
          margin-bottom: 11px;
          color: rgba(
            242,
            238,
            228,
            0.4
          );
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.2em;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          border: 0;
          border-bottom: 1px solid
            rgba(201, 166, 107, 0.32);
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
          font-size: clamp(
            28px,
            4vw,
            44px
          );
          font-weight: 400;
        }

        input::placeholder {
          color: rgba(
            242,
            238,
            228,
            0.18
          );
        }

        input:focus {
          border-bottom-color: rgba(
            209,
            173,
            112,
            0.8
          );
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
          border-top: 1px solid
            rgba(255, 255, 255, 0.07);
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.07);
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
          color: rgba(
            242,
            238,
            228,
            0.42
          );
          font-size: 11px;
          line-height: 1.65;
        }

        .actions,
        .discoverActions {
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
          color: rgba(
            242,
            238,
            228,
            0.42
          );
        }

        .secondaryAction:hover {
          color: #f2eee4;
        }

        .primaryAction {
          border: 1px solid
            rgba(201, 166, 107, 0.5);
          background: rgba(
            201,
            166,
            107,
            0.08
          );
          color: #d1ad70;
        }

        .primaryAction:hover:not(
            :disabled
          ) {
          border-color: rgba(
            209,
            173,
            112,
            0.85
          );
          background: rgba(
            201,
            166,
            107,
            0.13
          );
        }

        .primaryAction:disabled {
          opacity: 0.3;
          cursor: default;
        }

        .findingPanel {
          min-height: 180px;
          padding: 34px 0;
          display: flex;
          align-items: center;
          gap: 28px;
          border-top: 1px solid
            rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.1);
        }

        .findingMark {
          width: 56px;
          height: 56px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border: 1px solid
            rgba(201, 166, 107, 0.5);
          border-radius: 50%;
          animation: pulse 1.6s
            ease-in-out infinite;
        }

        .findingMark span {
          color: #d1ad70;
          transform: rotate(45deg);
        }

        .findingLabel {
          color: #d1ad70;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
        }

        .findingPanel p {
          margin: 10px 0 0;
          color: rgba(
            242,
            238,
            228,
            0.42
          );
          font-size: 12px;
        }

        @keyframes pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0
              rgba(
                201,
                166,
                107,
                0.08
              );
          }

          50% {
            box-shadow: 0 0 0 14px
              rgba(
                201,
                166,
                107,
                0.025
              );
          }
        }

        .errorPanel {
          padding: 30px 0;
          border-top: 1px solid
            rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.1);
        }

        .errorPanel > span {
          color: #b89966;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.2em;
        }

        .errorPanel p {
          max-width: 600px;
          margin: 12px 0 20px;
          color: rgba(
            242,
            238,
            228,
            0.52
          );
          font-size: 13px;
          line-height: 1.7;
        }

        .errorPanel button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #d1ad70;
          cursor: pointer;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }

        .resultsHeader {
          padding: 14px 0;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid
            rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.1);
          color: rgba(
            242,
            238,
            228,
            0.35
          );
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .resultList {
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.1);
        }

        .resultCard {
          display: grid;
          grid-template-columns:
            54px minmax(0, 1fr)
            130px;
          gap: 24px;
          padding: 30px 0;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.07);
        }

        .resultCard:last-child {
          border-bottom: 0;
        }

        .resultNumber {
          padding-top: 5px;
          color: rgba(
            209,
            173,
            112,
            0.5
          );
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
        }

        .resultMain h2 {
          margin: 0;
          max-width: 600px;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(
            24px,
            3vw,
            34px
          );
          line-height: 1.08;
          font-weight: 400;
        }

        .activityRow {
          margin-top: 15px;
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .activityRow span {
          padding: 6px 8px;
          border: 1px solid
            rgba(201, 166, 107, 0.2);
          color: rgba(
            209,
            173,
            112,
            0.72
          );
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.12em;
        }

        .whyFit {
          max-width: 650px;
          margin: 16px 0 0;
          color: rgba(
            242,
            238,
            228,
            0.48
          );
          font-size: 11px;
          line-height: 1.7;
        }

        .distance {
          margin: 13px 0 0;
          color: rgba(
            242,
            238,
            228,
            0.28
          );
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }

        .resultSelect {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .resultSelect button {
          padding: 12px 0 12px 12px;
          border: 0;
          background: transparent;
          color: #d1ad70;
          cursor: pointer;
          text-align: right;
          font-size: 8px;
          font-weight: 700;
          line-height: 1.5;
          letter-spacing: 0.13em;
        }

        .resultSelect button span {
          display: inline-block;
          margin-left: 7px;
          font-size: 14px;
          transition:
            transform 160ms ease;
        }

        .resultSelect button:hover span {
          transform: translateX(4px);
        }

        .destinationFooter {
          position: relative;
          z-index: 2;
          width: min(980px, 100%);
          margin: 68px auto 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          color: rgba(
            242,
            238,
            228,
            0.26
          );
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.22em;
        }

        .footerLine {
          width: 48px;
          height: 1px;
          background: rgba(
            242,
            238,
            228,
            0.14
          );
        }

        @media (max-width: 760px) {
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

          .choiceGrid {
            grid-template-columns: 1fr;
          }

          .choiceCard {
            min-height: 280px;
          }

          .secondaryFields {
            grid-template-columns: 1fr;
          }

          .actions,
          .discoverActions {
            align-items: stretch;
            flex-direction: column-reverse;
          }

          .primaryAction,
          .secondaryAction {
            width: 100%;
          }

          .resultCard {
            grid-template-columns:
              34px minmax(0, 1fr);
            gap: 14px;
          }

          .resultSelect {
            grid-column: 2;
            justify-content: flex-start;
          }

          .resultSelect button {
            padding-left: 0;
            text-align: left;
          }
        }
      `}</style>
    </main>
  );
}
