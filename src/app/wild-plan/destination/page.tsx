"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PlannerProgress from "@/components/PlannerProgress";

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

  const [vehicle, setVehicle] = useState("suv");
  const [trip, setTrip] = useState("weekend");

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
    const params = new URLSearchParams(window.location.search);
    setVehicle(params.get("vehicle") || "suv");
    setTrip(params.get("trip") || "weekend");

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
        <Link href="/" className="destinationBrand">
          <strong>ROAMLAB</strong>
          <span>PLANS · GEAR · STORIES</span>
        </Link>

        <nav className="destinationNav">
          <Link href="/explore">EXPLORE</Link>
          <Link href="/plan">PLAN</Link>
          <Link href="/prepare">PREPARE</Link>
          <Link href="/safety">SAFETY</Link>
          <Link href="/learn">LEARN</Link>
          <Link href="/journal">JOURNAL</Link>
          <Link href="/stories">STORIES</Link>
          <Link href="/badges">BADGES</Link>
          <Link href="/signin">SIGN IN</Link>
          <Link href="/start-here" className="destinationStart">
            START YOUR WILD →
          </Link>
        </nav>
      </header>

      <PlannerProgress
        currentStep={5}
        vehicle={vehicle}
        trip={trip}
      />

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
