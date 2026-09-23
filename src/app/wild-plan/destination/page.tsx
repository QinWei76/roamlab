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

import {
  getOriginLocationById,
  getOriginLocationLabel,
  originLocations,
} from "@/data/originLocations";

type DestinationMode =
  | "choose"
  | "known"
  | "discover";

type TravelRadius =
  | 150
  | 300
  | 500
  | "anywhere";

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

const travelRadiusOptions: {
  value: TravelRadius;
  label: string;
  detail: string;
}[] = [
  {
    value: 150,
    label: "~150 KM",
    detail: "Close to home",
  },
  {
    value: 300,
    label: "~300 KM",
    detail: "Weekend range",
  },
  {
    value: 500,
    label: "~500 KM",
    detail: "Go farther",
  },
  {
    value: "anywhere",
    label: "ANYWHERE",
    detail: "No distance limit",
  },
];

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

  const [selectedOriginId, setSelectedOriginId] =
    useState("");

  const [travelRadius, setTravelRadius] =
    useState<TravelRadius>(300);

  const [loaded, setLoaded] =
    useState(false);

  const [discovering, setDiscovering] =
    useState(false);

  const [hasSearched, setHasSearched] =
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

    const currentIntent =
      wild?.plan.adventure.intent;

    const currentOrigin =
      currentIntent?.startingFrom;

    if (currentOrigin) {
      const existingOrigin =
        originLocations.find(
          (location) =>
            location.name ===
              currentOrigin.name &&
            location.region ===
              currentOrigin.region
        );

      if (existingOrigin) {
        setSelectedOriginId(
          existingOrigin.id
        );
      }
    }

    const currentDistance =
      currentIntent?.maxTravelDistanceKm;

    if (
      currentDistance === 150 ||
      currentDistance === 300 ||
      currentDistance === 500
    ) {
      setTravelRadius(
        currentDistance
      );
    } else if (
      currentOrigin &&
      currentDistance === undefined
    ) {
      setTravelRadius("anywhere");
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

  function openDiscovery() {
    setMode("discover");
    setMatches([]);
    setHasSearched(false);
    setDiscoveryError("");
  }

  async function discoverDestinations() {
    if (!selectedOriginId) {
      setDiscoveryError(
        "Choose where this Wild begins."
      );
      return;
    }

    const origin =
      getOriginLocationById(
        selectedOriginId
      );

    if (!origin) {
      setDiscoveryError(
        "We couldn't read that starting point."
      );
      return;
    }

    const wild =
      getOrCreateCurrentWild(
        "My Wild"
      );

    const existingIntent =
      wild.plan.adventure.intent;

    if (!existingIntent) {
      setDiscoveryError(
        "Your Wild needs a little more direction before we can find the right places."
      );
      return;
    }

    setDiscovering(true);
    setHasSearched(true);
    setDiscoveryError("");
    setMatches([]);

    try {
      updateWildIntent({
        destinationMode: "discover",

        startingFrom: {
          name: origin.name,
          region: origin.region,
          country: origin.country,
          coordinates: {
            latitude:
              origin.coordinates.latitude,
            longitude:
              origin.coordinates.longitude,
          },
        },

        maxTravelDistanceKm:
          travelRadius === "anywhere"
            ? undefined
            : travelRadius,
      });

      const latestWild =
        getCurrentWild();

      const latestIntent =
        latestWild?.plan.adventure.intent;

      const schedule =
        latestWild?.plan.adventure.schedule;

      if (!latestIntent) {
        throw new Error(
          "Wild intent could not be loaded."
        );
      }

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
          "No strong matches surfaced inside this range. Try going farther."
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
    setHasSearched(false);
  }

  function editDiscovery() {
    setMatches([]);
    setHasSearched(false);
    setDiscoveryError("");
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

  const selectedOrigin =
    selectedOriginId
      ? getOriginLocationById(
          selectedOriginId
        )
      : undefined;

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
                onClick={openDiscovery}
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
                    Start from home, choose
                    how far you want to go,
                    and surface real places
                    that fit your Wild.
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
              Tell us where this journey
              begins and how far you want
              to roam. We will use the
              direction already inside your
              Wild to find real places.
            </p>

            {!hasSearched &&
              !discovering && (
                <div className="discoverySetup">
                  <div className="setupBlock">
                    <div className="setupHeading">
                      <span className="setupNumber">
                        01
                      </span>

                      <div>
                        <span className="setupLabel">
                          STARTING FROM
                        </span>

                        <h2>
                          Where does this
                          Wild begin?
                        </h2>
                      </div>
                    </div>

                    <div className="selectWrap">
                      <select
                        value={
                          selectedOriginId
                        }
                        onChange={(event) => {
                          setSelectedOriginId(
                            event.target.value
                          );
                          setDiscoveryError(
                            ""
                          );
                        }}
                      >
                        <option value="">
                          Choose your starting
                          city
                        </option>

                        {originLocations.map(
                          (location) => (
                            <option
                              key={
                                location.id
                              }
                              value={
                                location.id
                              }
                            >
                              {getOriginLocationLabel(
                                location
                              )}
                            </option>
                          )
                        )}
                      </select>

                      <span
                        className="selectArrow"
                        aria-hidden="true"
                      >
                        ↓
                      </span>
                    </div>

                    {selectedOrigin && (
                      <p className="selectedHint">
                        THIS WILD STARTS IN{" "}
                        <strong>
                          {getOriginLocationLabel(
                            selectedOrigin
                          ).toUpperCase()}
                        </strong>
                      </p>
                    )}
                  </div>

                  <div className="setupBlock radiusBlock">
                    <div className="setupHeading">
                      <span className="setupNumber">
                        02
                      </span>

                      <div>
                        <span className="setupLabel">
                          TRAVEL RANGE
                        </span>

                        <h2>
                          How far do you want
                          to go?
                        </h2>
                      </div>
                    </div>

                    <div className="radiusGrid">
                      {travelRadiusOptions.map(
                        (option) => (
                          <button
                            type="button"
                            key={String(
                              option.value
                            )}
                            className={`radiusOption ${
                              travelRadius ===
                              option.value
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              setTravelRadius(
                                option.value
                              )
                            }
                          >
                            <strong>
                              {option.label}
                            </strong>

                            <span>
                              {option.detail}
                            </span>
                          </button>
                        )
                      )}
                    </div>

                    <p className="rangeNote">
                      RANGE IS BASED ON
                      APPROXIMATE GEOGRAPHIC
                      DISTANCE — NOT DRIVING
                      ROUTE DISTANCE.
                    </p>
                  </div>

                  {discoveryError && (
                    <div className="inlineError">
                      {discoveryError}
                    </div>
                  )}

                  <div className="findAction">
                    <div>
                      <span>
                        READY TO ROAM
                      </span>

                      <p>
                        RoamLab will combine
                        this range with your
                        Wild&apos;s activities
                        and landscape
                        preferences.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="primaryAction findButton"
                      onClick={() =>
                        void discoverDestinations()
                      }
                      disabled={
                        !selectedOriginId
                      }
                    >
                      FIND MY WILD →
                    </button>
                  </div>
                </div>
              )}

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
                    Looking for places that
                    fit your activities,
                    landscape and travel
                    range...
                  </p>
                </div>
              </div>
            )}

            {!discovering &&
              hasSearched &&
              discoveryError && (
                <div className="errorPanel">
                  <span>
                    NO CLEAR TRAIL YET
                  </span>

                  <p>
                    {discoveryError}
                  </p>

                  <div className="errorActions">
                    <button
                      type="button"
                      onClick={editDiscovery}
                    >
                      CHANGE RANGE →
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void discoverDestinations()
                      }
                    >
                      TRY AGAIN →
                    </button>
                  </div>
                </div>
              )}

            {!discovering &&
              matches.length > 0 && (
                <div className="destinationBoardSection">
                  <div className="boardToolbar">
                    <div className="boardToolbarItem">
                      <span>STARTING FROM</span>
                      <strong>
                        {selectedOrigin
                          ? getOriginLocationLabel(
                              selectedOrigin
                            )
                          : "—"}
                      </strong>
                    </div>

                    <div className="boardToolbarItem">
                      <span>TRAVEL RANGE</span>
                      <strong>
                        {travelRadius === "anywhere"
                          ? "Anywhere"
                          : `~${travelRadius} km`}
                      </strong>
                    </div>

                    <div className="boardToolbarCount">
                      <span>
                        {matches.length
                          .toString()
                          .padStart(
                            2,
                            "0"
                          )}{" "}
                        PLACES FOUND
                      </span>
                    </div>

                    <button
                      type="button"
                      className="boardChange"
                      onClick={editDiscovery}
                    >
                      CHANGE START / RANGE
                    </button>
                  </div>

                  <div className="destinationBoard">
                    <div className="boardShade" />

                    {matches
                      .slice(0, 5)
                      .map(
                        (match, index) => (
                          <button
                            type="button"
                            key={`${match.source}-${match.sourceId}`}
                            className={`destinationPin destinationPin${
                              index + 1
                            }`}
                            onClick={() =>
                              selectDiscoveredDestination(
                                match
                              )
                            }
                            aria-label={`Choose ${match.name}`}
                          >
                            <span className="pinNumber">
                              {(index + 1)
                                .toString()
                                .padStart(
                                  2,
                                  "0"
                                )}
                            </span>

                            <span className="pinContent">
                              <strong className="pinName">
                                {match.name}
                              </strong>

                              {match.activities &&
                                match.activities
                                  .length > 0 && (
                                  <span className="pinActivities">
                                    {match.activities
                                      .slice(0, 3)
                                      .map(
                                        (activity) =>
                                          activity
                                            .replace(
                                              /-/g,
                                              " "
                                            )
                                            .toUpperCase()
                                      )
                                      .join(
                                        " · "
                                      )}
                                  </span>
                                )}

                              {typeof match.distanceKm ===
                                "number" && (
                                <span className="pinDistance">
                                  {Math.round(
                                    match.distanceKm
                                  ).toLocaleString()}{" "}
                                  KM FROM START
                                </span>
                              )}

                              <span className="pinChoose">
                                CHOOSE THIS WILD →
                              </span>
                            </span>
                          </button>
                        )
                      )}

                    <div className="boardLegend">
                      <span>
                        PLACES FOR THIS WILD
                      </span>
                      <span>
                        REAL DESTINATIONS ·
                        MATCHED TO YOUR WILD
                      </span>
                    </div>
                  </div>

                  <div className="discoverActions">
                    <button
                      type="button"
                      className="secondaryAction"
                      onClick={editDiscovery}
                    >
                      CHANGE START / RANGE
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
                </div>
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
        input,
        select {
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

        .discoverySetup {
          border-top: 1px solid
            rgba(255, 255, 255, 0.1);
        }

        .setupBlock {
          padding: 34px 0 38px;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.08);
        }

        .setupHeading {
          display: grid;
          grid-template-columns:
            48px minmax(0, 1fr);
          gap: 18px;
          align-items: start;
        }

        .setupNumber {
          padding-top: 6px;
          color: rgba(
            209,
            173,
            112,
            0.48
          );
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
        }

        .setupLabel {
          display: block;
          margin-bottom: 8px;
          color: #b89966;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.2em;
        }

        .setupHeading h2 {
          margin: 0;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(
            24px,
            3vw,
            34px
          );
          line-height: 1.1;
          font-weight: 400;
        }

        .selectWrap {
          position: relative;
          margin: 28px 0 0 66px;
          max-width: 610px;
        }

        .selectWrap select {
          width: 100%;
          padding: 18px 46px 18px 0;
          appearance: none;
          border: 0;
          border-bottom: 1px solid
            rgba(201, 166, 107, 0.4);
          border-radius: 0;
          outline: none;
          background: transparent;
          color: #f2eee4;
          cursor: pointer;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 22px;
        }

        .selectWrap select option {
          background: #171611;
          color: #f2eee4;
        }

        .selectArrow {
          position: absolute;
          right: 4px;
          top: 50%;
          pointer-events: none;
          color: #b89966;
          transform: translateY(-50%);
        }

        .selectedHint {
          margin: 14px 0 0 66px;
          color: rgba(
            242,
            238,
            228,
            0.3
          );
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }

        .selectedHint strong {
          color: rgba(
            209,
            173,
            112,
            0.72
          );
          font-weight: 700;
        }

        .radiusGrid {
          margin: 28px 0 0 66px;
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .radiusOption {
          min-height: 92px;
          padding: 16px 13px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
          border: 1px solid
            rgba(255, 255, 255, 0.09);
          background: rgba(
            255,
            255,
            255,
            0.012
          );
          color: #f2eee4;
          cursor: pointer;
          text-align: left;
          transition:
            border-color 160ms ease,
            background 160ms ease;
        }

        .radiusOption strong {
          color: rgba(
            242,
            238,
            228,
            0.72
          );
          font-size: 10px;
          letter-spacing: 0.12em;
        }

        .radiusOption span {
          color: rgba(
            242,
            238,
            228,
            0.3
          );
          font-size: 9px;
        }

        .radiusOption:hover,
        .radiusOption.selected {
          border-color: rgba(
            209,
            173,
            112,
            0.52
          );
          background: rgba(
            201,
            166,
            107,
            0.065
          );
        }

        .radiusOption.selected strong {
          color: #d1ad70;
        }

        .rangeNote {
          margin: 15px 0 0 66px;
          color: rgba(
            242,
            238,
            228,
            0.24
          );
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.12em;
        }

        .inlineError {
          margin-top: 20px;
          padding: 14px 0;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.08);
          color: #caa56b;
          font-size: 10px;
        }

        .findAction {
          padding: 30px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }

        .findAction > div > span {
          color: #b89966;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .findAction p {
          max-width: 520px;
          margin: 8px 0 0;
          color: rgba(
            242,
            238,
            228,
            0.36
          );
          font-size: 10px;
          line-height: 1.6;
        }

        .findButton {
          flex: 0 0 auto;
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

        .errorActions {
          display: flex;
          gap: 24px;
        }

        .errorActions button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #d1ad70;
          cursor: pointer;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }

        /* DESTINATION BOARD */

        .destinationBoardSection {
          position: relative;
          width: min(
            1380px,
            calc(100vw - 64px)
          );
          left: 50%;
          transform: translateX(-50%);
          margin-top: 12px;
        }

        .boardToolbar {
          width: min(1180px, 100%);
          margin: 0 auto 18px;
          padding: 14px 18px;
          box-sizing: border-box;
          display: grid;
          grid-template-columns:
            minmax(0, 1.2fr)
            minmax(0, 0.8fr)
            auto auto;
          gap: 28px;
          align-items: center;
          border: 1px solid
            rgba(210, 190, 154, 0.16);
          background: rgba(15, 14, 11, 0.78);
          backdrop-filter: blur(10px);
        }

        .boardToolbarItem {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .boardToolbarItem span,
        .boardToolbarCount span {
          color: rgba(230, 218, 194, 0.42);
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.16em;
        }

        .boardToolbarItem strong {
          overflow: hidden;
          color: rgba(244, 238, 224, 0.82);
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 15px;
          font-weight: 400;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .boardToolbarCount {
          white-space: nowrap;
        }

        .boardChange {
          padding: 0;
          border: 0;
          background: transparent;
          color: #c7a46b;
          cursor: pointer;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.13em;
        }

        .boardChange:hover {
          color: #ead09b;
        }

        .destinationBoard {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 2;
          overflow: hidden;

          /*
           * The physical RoamLab destination desk is the board itself.
           * The file lives at /public/destination-board.jpg, so Next.js
           * serves it from /destination-board.jpg.
           */
          background-image: url("/destination-board.jpg");
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          background-color: #17130e;

          box-shadow:
            0 35px 100px
              rgba(0, 0, 0, 0.52),
            0 0 0 1px
              rgba(255, 255, 255, 0.035);
        }

        .boardShade {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(7, 6, 4, 0.05) 0%,
            transparent 30%,
            transparent 72%,
            rgba(7, 6, 4, 0.16) 100%
          );
        }

        .destinationPin {
          position: absolute;
          z-index: 4;
          padding: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #211d17;
          cursor: pointer;
          text-align: left;
          transform-origin: center;
          transition:
            transform 180ms ease,
            filter 180ms ease;
        }

        .destinationPin:hover {
          z-index: 8;
          filter: drop-shadow(
            0 12px 12px
              rgba(0, 0, 0, 0.28)
          );
        }

        .destinationPin:focus-visible {
          outline: 2px solid
            rgba(238, 213, 165, 0.95);
          outline-offset: 4px;
        }

        .destinationPin1 {
          left: 27.1%;
          top: 25.7%;
          width: 16.8%;
          height: 23.8%;
          transform: rotate(-4.7deg);
        }

        .destinationPin1:hover {
          transform:
            rotate(-4.7deg)
            translateY(-4px)
            scale(1.025);
        }

        .destinationPin2 {
          left: 62.2%;
          top: 25.1%;
          width: 17%;
          height: 24.5%;
          transform: rotate(4.7deg);
        }

        .destinationPin2:hover {
          transform:
            rotate(4.7deg)
            translateY(-4px)
            scale(1.025);
        }

        .destinationPin3 {
          left: 42.6%;
          top: 43.3%;
          width: 17.1%;
          height: 25%;
          transform: rotate(1deg);
        }

        .destinationPin3:hover {
          transform:
            rotate(1deg)
            translateY(-4px)
            scale(1.025);
        }

        .destinationPin4 {
          left: 20.8%;
          top: 62.7%;
          width: 17%;
          height: 24.4%;
          transform: rotate(4.2deg);
        }

        .destinationPin4:hover {
          transform:
            rotate(4.2deg)
            translateY(-4px)
            scale(1.025);
        }

        .destinationPin5 {
          left: 64.5%;
          top: 61.6%;
          width: 17%;
          height: 24.5%;
          transform: rotate(5.8deg);
        }

        .destinationPin5:hover {
          transform:
            rotate(5.8deg)
            translateY(-4px)
            scale(1.025);
        }

        .pinNumber {
          position: absolute;
          left: 8%;
          top: 6%;
          display: grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(39, 33, 25, 0.88);
          color: #f2e5c9;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.08em;
          box-shadow: 0 2px 7px
            rgba(0, 0, 0, 0.22);
        }

        .pinContent {
          position: absolute;
          left: 8%;
          right: 8%;
          bottom: 4%;
          min-height: 31%;
          display: flex;
          flex-direction: column;
          padding: 5% 3% 1%;
          box-sizing: border-box;
        }

        .pinName {
          display: -webkit-box;
          overflow: hidden;
          color: #29241d;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(
            9px,
            0.9vw,
            15px
          );
          font-weight: 700;
          line-height: 1.05;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .pinActivities {
          margin-top: 4px;
          overflow: hidden;
          color: rgba(42, 36, 28, 0.65);
          font-size: clamp(
            5px,
            0.45vw,
            7px
          );
          font-weight: 800;
          line-height: 1.3;
          letter-spacing: 0.06em;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pinDistance {
          margin-top: 4px;
          color: rgba(42, 36, 28, 0.55);
          font-size: clamp(
            5px,
            0.42vw,
            7px
          );
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .pinChoose {
          margin-top: auto;
          padding-top: 4px;
          color: #6d4c25;
          font-size: clamp(
            5px,
            0.45vw,
            7px
          );
          font-weight: 900;
          letter-spacing: 0.07em;
          opacity: 0;
          transform: translateY(3px);
          transition:
            opacity 150ms ease,
            transform 150ms ease;
        }

        .destinationPin:hover
          .pinChoose,
        .destinationPin:focus-visible
          .pinChoose {
          opacity: 1;
          transform: translateY(0);
        }

        .boardLegend {
          position: absolute;
          left: 22.5%;
          right: 18.5%;
          bottom: 3.8%;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          pointer-events: none;
          color: rgba(48, 39, 29, 0.56);
          font-size: clamp(
            5px,
            0.48vw,
            8px
          );
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .destinationBoardSection
          .discoverActions {
          width: min(1180px, 100%);
          margin: 26px auto 0;
        }

        @media (max-width: 980px) {
          .destinationBoardSection {
            width: calc(100vw - 32px);
          }

          .boardToolbar {
            grid-template-columns:
              1fr 1fr;
          }

          .boardToolbarCount {
            align-self: center;
          }

          .boardChange {
            text-align: right;
          }
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

          .setupHeading {
            grid-template-columns:
              34px minmax(0, 1fr);
            gap: 12px;
          }

          .selectWrap,
          .selectedHint,
          .radiusGrid,
          .rangeNote {
            margin-left: 46px;
          }

          .radiusGrid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .findAction {
            align-items: stretch;
            flex-direction: column;
          }

          .findButton {
            width: 100%;
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

          .destinationBoardSection {
            width: calc(100vw - 20px);
            overflow-x: auto;
            padding-bottom: 8px;
          }

          .boardToolbar {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .boardChange {
            text-align: left;
          }

          .destinationBoard {
            min-width: 820px;
          }

        }
      `}</style>
    </main>
  );
}
