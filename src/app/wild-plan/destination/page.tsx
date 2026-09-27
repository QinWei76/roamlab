"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
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

function getWildMatchStars(score?: number | null) {
  const value = typeof score === "number" ? score : 0;

  if (value >= 60) return 5;
  if (value >= 45) return 4;
  if (value >= 30) return 3;
  if (value >= 15) return 2;
  return 1;
}

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

  const [activeMatchIndex, setActiveMatchIndex] =
    useState(0);
  const [confirmDestinationOpen, setConfirmDestinationOpen] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);

  const [discoveryError, setDiscoveryError] =
    useState("");

  const [vehicle, setVehicle] = useState("");
  const [trip, setTrip] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setVehicle(params.get("vehicle") || "");
    setTrip(params.get("trip") || "");

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
    setActiveMatchIndex(0);
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
    setActiveMatchIndex(0);
    setHasSearched(false);
  }

  function editDiscovery() {
    setMatches([]);
    setActiveMatchIndex(0);
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
      <div className="scene" aria-hidden="true" />
      <div className="sceneShade" aria-hidden="true" />

      <header className="destinationHeader">
        <div className="headerLeft">
          <button type="button" className="brand" onClick={() => router.push("/")}>ROAMLAB</button>
          <span className="brandSub">PLANS · GEAR · STORIES</span>
        </div>
        <nav className="topNav" aria-label="RoamLab navigation">
          <button type="button" onClick={() => router.push("/")}>EXPLORE</button>
          <button type="button" onClick={() => router.push("/wild-plan")}>PLAN</button>
          <button type="button">PREPARE</button>
          <button type="button">SIGN IN</button>
          <button
            type="button"
            className="startWild"
            disabled={matches.length === 0}
            onClick={() => {
              const activeMatch = matches[activeMatchIndex] ?? matches[0];
              if (activeMatch) setConfirmDestinationOpen(true);
            }}
          >
            {matches.length > 0 ? "SET AS MY DESTINATION →" : "START YOUR WILD →"}
          </button>
        </nav>
      </header>

      <div className="progressWrap">
        <PlannerProgress currentStep={5} vehicle={vehicle} trip={trip} />
      </div>

      <section className="boardStage">
        {mode === "choose" && (
          <div className="entryTools">
            <button type="button" className="sceneTag" onClick={() => setMode("known")}>
              <span>01</span><strong>I KNOW WHERE</strong><em>ENTER A PLACE →</em>
            </button>
            <button type="button" className="sceneTag active" onClick={openDiscovery}>
              <span>02</span><strong>DISCOVER FOR ME</strong><em>FIND MY WILD →</em>
            </button>
          </div>
        )}

        {mode === "known" && (
          <form className="knownTool" onSubmit={saveKnownDestination}>
            <div className="toolTopline">
              <button type="button" onClick={resetChoice}>← BACK</button>
              <span>KNOWN DESTINATION</span>
            </div>
            <label>
              <span>DESTINATION</span>
              <input autoFocus autoComplete="off" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Yosemite National Park" />
            </label>
            <div className="knownSecondary">
              <label><span>REGION · OPTIONAL</span><input autoComplete="off" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="California" /></label>
              <label><span>COUNTRY · OPTIONAL</span><input autoComplete="off" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" /></label>
            </div>
            <button type="submit" className="orangeButton" disabled={!destination.trim()}>SAVE TO MY WILD →</button>
          </form>
        )}

        {mode === "discover" && !hasSearched && !discovering && (
          <div className="discoveryTool">
            <div className="toolTopline">
              <button type="button" onClick={resetChoice}>← BACK</button>
              <span>DESTINATION DISCOVERY</span>
            </div>
            <div className="discoveryRow">
              <label className="originField">
                <span>STARTING FROM</span>
                <select value={selectedOriginId} onChange={(e) => { setSelectedOriginId(e.target.value); setDiscoveryError(""); }}>
                  <option value="">Choose your starting city</option>
                  {originLocations.map((location) => <option key={location.id} value={location.id}>{getOriginLocationLabel(location)}</option>)}
                </select>
              </label>
              <div className="rangeField">
                <span>TRAVEL RANGE</span>
                <div className="rangeChoices">
                  {travelRadiusOptions.map((option) => (
                    <button type="button" key={String(option.value)} className={travelRadius === option.value ? "selected" : ""} onClick={() => setTravelRadius(option.value)}>{option.label}</button>
                  ))}
                </div>
              </div>
              <button type="button" className="orangeButton findButton" onClick={() => void discoverDestinations()} disabled={!selectedOriginId}>FIND MY WILD →</button>
            </div>
            <p className="distanceNote">APPROXIMATE GEOGRAPHIC DISTANCE · NOT DRIVING ROUTE DISTANCE</p>
            {discoveryError && <p className="toolError">{discoveryError}</p>}
          </div>
        )}

        {discovering && (
          <div className="searchingTool"><span className="searchMark">◆</span><div><strong>FINDING YOUR WILD</strong><p>Matching real places to your Wild, landscape and travel range…</p></div></div>
        )}

        {!discovering && hasSearched && discoveryError && matches.length === 0 && (
          <div className="searchingTool errorTool">
            <div><strong>NO CLEAR TRAIL YET</strong><p>{discoveryError}</p></div>
            <div className="errorButtons"><button type="button" onClick={editDiscovery}>CHANGE RANGE</button><button type="button" onClick={() => void discoverDestinations()}>TRY AGAIN →</button></div>
          </div>
        )}

        {!discovering && matches.length > 0 && (() => {
          const activeMatch = matches[activeMatchIndex] ?? matches[0];
          const activeRank = Math.min(activeMatchIndex + 1, matches.length);
          const fitPoints =
            activeMatch.matchReasons && activeMatch.matchReasons.length > 0
              ? activeMatch.matchReasons.slice(0, 3)
              : activeMatch.whyItFits
                ? [activeMatch.whyItFits]
                : ["Strong alignment with your current Wild setup."];

          return (
            <div className="briefSheet">
              <section className="briefMain">
                <div className="mainTopline">
                  <div>
                    <span className="rankNumber">{String(activeRank).padStart(2, "0")}</span>
                    <span className="rankStatus">
                      {activeMatchIndex === 0 ? "BEST MATCH" : "VIEWING"}
                    </span>
                  </div>
                  <button type="button" className="changeBrief" onClick={editDiscovery}>
                    CHANGE SEARCH
                  </button>
                </div>

                <span className="sectionLabel">DESTINATION</span>
                <div className="destinationTitleSlot">
                  <h1 className={activeMatch.name.length > 34 ? "longTitle" : ""}>{activeMatch.name}</h1>
                </div>

                <div className="primaryMetrics">
                                    <div className="wildMatchMetric">
                    <span>WILD MATCH</span>
                    <strong
                      className="matchStars"
                      aria-label={`${getWildMatchStars(activeMatch.matchScore)} out of 5 match`}
                    >
                      {"★".repeat(getWildMatchStars(activeMatch.matchScore))}
                      <i>{"☆".repeat(5 - getWildMatchStars(activeMatch.matchScore))}</i>
                    </strong>
                  </div>
                  <div>
                    <span>DISTANCE</span>
                    <strong>
                      {typeof activeMatch.distanceKm === "number"
                        ? `${Math.round(activeMatch.distanceKm).toLocaleString()} KM`
                        : "—"}
                    </strong>
                  </div>
                </div>

                <div className="fitReason">
                  <span>WHY THIS FITS YOUR WILD</span>
                  <p>
                    {activeMatch.whyItFits ||
                      activeMatch.matchReasons?.slice(0, 3).join(" · ") ||
                      "Strong alignment with your current Wild setup."}
                  </p>
                  <button
                    type="button"
                    className="readAssessment"
                    onClick={() => setAssessmentOpen(true)}
                  >
                    VIEW FULL ASSESSMENT →
                  </button>
                </div>

              </section>

              <aside className="briefContext">
                <span className="panelLabel">WILD CONTEXT</span>
                <div>
                  <span>STARTING FROM</span>
                  <strong>{selectedOrigin ? getOriginLocationLabel(selectedOrigin) : "—"}</strong>
                </div>
                <div>
                  <span>TRAVEL RANGE</span>
                  <strong>{travelRadius === "anywhere" ? "ANYWHERE" : `~${travelRadius} KM`}</strong>
                </div>
                <div>
                  <span>MATCHES</span>
                  <strong>{matches.length.toString().padStart(2, "0")}</strong>
                </div>
              </aside>

              <aside className="assessmentPanel">
                <span className="panelLabel">FIELD ASSESSMENT</span>
                <div className="assessmentList">
                  {fitPoints.map((point, index) => (
                    <p key={`${point}-${index}`}>
                      <span>✓</span>{point}
                    </p>
                  ))}
                </div>
                <small>ENVIRONMENT DATA · COMING NEXT</small>
              </aside>

              <aside className="alternatives">
                <div className="alternativesHeading">
                  <span>DESTINATION MATCHES</span>
                  <small>CLICK TO VIEW</small>
                </div>

                <div className="alternativeList">
                  {matches.slice(0, 5).map((match, index) => {
                    const isActive = index === activeMatchIndex;
                    return (
                      <button
                        type="button"
                        key={`${match.source}-${match.sourceId}`}
                        className={`alternativeRow ${isActive ? "active" : ""}`}
                        onClick={() => setActiveMatchIndex(index)}
                      >
                        <span className="altRank">{String(index + 1).padStart(2, "0")}</span>
                        <span className="altName">{match.name}</span>
                        <span className="altMeta">
                          {index === 0 ? "BEST MATCH" : isActive ? "VIEWING" : "VIEW"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <section className="fieldNote">
                <span className="panelLabel">PLANNING NOTE</span>
                <p>
                  Review the destination fit before confirming. Weather, elevation,
                  topography and land-cover intelligence will appear here in the next
                  enrichment step.
                </p>
              </section>

              <footer className="briefFooter">
                <div>
                  <strong>WILD DESTINATION BRIEF</strong>
                  <span>PRE-DEPARTURE PLANNING DOCUMENT</span>
                </div>
                <span>DESTINATION · REVIEW</span>
              </footer>
            </div>
          );
        })()}

        {assessmentOpen && matches.length > 0 && (() => {
          const activeMatch = matches[activeMatchIndex] ?? matches[0];
          const reasons =
            activeMatch.matchReasons?.length
              ? activeMatch.matchReasons
              : [activeMatch.whyItFits || "Strong alignment with your current Wild setup."];

          return (
            <div
              className="confirmBackdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setAssessmentOpen(false);
                }
              }}
            >
              <div
                className="assessmentModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="assessment-title"
              >
                <button
                  type="button"
                  className="confirmClose"
                  aria-label="Close full assessment"
                  onClick={() => setAssessmentOpen(false)}
                >
                  ×
                </button>

                <span className="confirmEyebrow">DESTINATION FIT ASSESSMENT</span>
                <h2 id="assessment-title">{activeMatch.name}</h2>

                <span className="assessmentSectionLabel">WHY IT MATCHES YOUR WILD</span>
                <p className="assessmentFullText">
                  {activeMatch.whyItFits || reasons.join(" · ")}
                </p>

                <div className="assessmentReasons">
                  <span>FIELD ASSESSMENT</span>
                  {reasons.map((reason, index) => (
                    <p key={`${reason}-${index}`}>
                      <b>✓</b>
                      {reason}
                    </p>
                  ))}
                </div>

                <button
                  type="button"
                  className="backToBrief"
                  onClick={() => setAssessmentOpen(false)}
                >
                  ← BACK TO DESTINATION BRIEF
                </button>
              </div>
            </div>
          );
        })()}

        {confirmDestinationOpen && matches.length > 0 && (() => {
          const activeMatch = matches[activeMatchIndex] ?? matches[0];
          return (
            <div className="confirmBackdrop" role="presentation" onMouseDown={(e) => {
              if (e.target === e.currentTarget) setConfirmDestinationOpen(false);
            }}>
              <div className="confirmModal" role="dialog" aria-modal="true" aria-labelledby="confirm-destination-title">
                <button type="button" className="confirmClose" aria-label="Close" onClick={() => setConfirmDestinationOpen(false)}>×</button>
                <span className="confirmEyebrow">CONFIRM DESTINATION</span>
                <h2 id="confirm-destination-title">{activeMatch.name}</h2>
                <p className="confirmIntro">
                  You’re setting this as the destination for your Wild. It will become the starting point for the rest of your Wild planning.
                </p>
                <div className="confirmFacts">
                  <div><span>STARTING FROM</span><strong>{selectedOrigin ? getOriginLocationLabel(selectedOrigin) : "—"}</strong></div>
                  <div><span>DISTANCE</span><strong>{typeof activeMatch.distanceKm === "number" ? `${Math.round(activeMatch.distanceKm).toLocaleString()} KM` : "—"}</strong></div>
                  <div>
                    <span>WILD MATCH</span>
                    <strong className="confirmMatchStars" aria-label={`${getWildMatchStars(activeMatch.matchScore)} out of 5 match`}>
                      {"★".repeat(getWildMatchStars(activeMatch.matchScore))}
                      <i>{"☆".repeat(5 - getWildMatchStars(activeMatch.matchScore))}</i>
                    </strong>
                  </div>
                </div>
                <div className="confirmActions">
                  <button type="button" className="keepExploring" onClick={() => setConfirmDestinationOpen(false)}>KEEP EXPLORING</button>
                  <button type="button" className="confirmDestination" onClick={() => {
                    setConfirmDestinationOpen(false);
                    selectDiscoveredDestination(activeMatch);
                  }}>CONFIRM DESTINATION →</button>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      <style jsx>{`
        :global(html), :global(body) { margin: 0; background: #0a0907; }
        .destinationPage { position: relative; min-height: 100vh; overflow: hidden; color: #f6f0e5; background: #0a0907; font-family: Arial, Helvetica, sans-serif; }
        .scene { position: fixed; inset: 0; z-index: 0; background: url("/destination-brief-v2.jpg") center center / cover no-repeat; }
        .sceneShade { position: fixed; inset: 0; z-index: 1; pointer-events: none; background: linear-gradient(180deg, rgba(4,4,3,.18) 0%, rgba(4,4,3,.03) 42%, rgba(4,4,3,.14) 100%); }
        button, input, select { font: inherit; }
        button { -webkit-tap-highlight-color: transparent; }
        .destinationHeader { position: relative; z-index: 20; height: 68px; padding: 0 38px; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; }
        .headerLeft { display: flex; align-items: baseline; gap: 18px; }
        .brand, .topNav button { border: 0; background: transparent; cursor: pointer; }
        .brand { padding: 0; color: #fffaf0; font-family: Georgia, "Times New Roman", serif; font-size: 19px; font-weight: 900; letter-spacing: .13em; text-shadow: 0 2px 12px rgba(0,0,0,.55); }
        .brandSub { color: rgba(255,255,255,.48); font-family: Georgia, "Times New Roman", serif; font-size: 8px; font-weight: 800; letter-spacing: .18em; }
        .topNav { display: flex; align-items: center; gap: 25px; }
        .topNav button { padding: 0; color: rgba(255,255,255,.76); font-family: Georgia, "Times New Roman", serif; font-size: 8px; font-weight: 800; letter-spacing: .13em; }
        .topNav .startWild { padding: 11px 16px; background: #d66524; color: #fff9ef; }
        .progressWrap { position: fixed; z-index: 40; left: 50%; bottom: 14px; width: min(890px, calc(100vw - 220px)); transform: translateX(-50%); }
        .boardStage { position: relative; z-index: 10; width: min(1220px, calc(100vw - 100px)); height: calc(100vh - 130px); min-height: 610px; margin: -58px auto 0; }

        .entryTools { position: absolute; left: 50%; bottom: 7.5%; transform: translateX(-50%); display: flex; gap: 12px; }
        .sceneTag { width: 205px; min-height: 62px; padding: 11px 14px; display: grid; grid-template-columns: 26px 1fr; grid-template-rows: auto auto; column-gap: 9px; text-align: left; border: 1px solid rgba(231,208,169,.35); background: rgba(13,11,8,.78); color: #f2eadc; cursor: pointer; box-shadow: 0 10px 32px rgba(0,0,0,.28); backdrop-filter: blur(4px); }
        .sceneTag:hover, .sceneTag.active:hover { border-color: #dd762f; background: rgba(21,14,9,.88); transform: translateY(-2px); }
        .sceneTag span { grid-row: 1 / 3; color: #d77735; font-size: 8px; font-weight: 900; letter-spacing: .12em; }
        .sceneTag strong { font-size: 10px; letter-spacing: .13em; }
        .sceneTag em { margin-top: 7px; color: rgba(242,234,220,.55); font-size: 7px; font-style: normal; font-weight: 800; letter-spacing: .12em; }
        .sceneTag.active { border-color: rgba(221,118,47,.72); }

        .knownTool, .discoveryTool, .searchingTool, .resultTool { position: absolute; z-index: 20; border: 1px solid rgba(226,204,168,.27); background: rgba(12,10,7,.84); box-shadow: 0 18px 50px rgba(0,0,0,.34); backdrop-filter: blur(7px); }
        .knownTool { left: 50%; bottom: 5%; width: min(620px, 82vw); padding: 17px 20px 19px; transform: translateX(-50%); }
        .toolTopline { margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between; }
        .toolTopline button, .resultTool button, .errorButtons button { padding: 0; border: 0; background: transparent; color: #d87935; cursor: pointer; font-size: 7px; font-weight: 900; letter-spacing: .14em; }
        .toolTopline span { color: rgba(246,240,229,.42); font-size: 7px; font-weight: 900; letter-spacing: .18em; }
        .knownTool label > span, .originField > span, .rangeField > span { display: block; margin-bottom: 7px; color: #d87935; font-size: 7px; font-weight: 900; letter-spacing: .16em; }
        .knownTool input, .originField select { width: 100%; box-sizing: border-box; outline: 0; border: 0; border-bottom: 1px solid rgba(226,204,168,.3); border-radius: 0; background: transparent; color: #f6f0e5; }
        .knownTool > label input { padding: 5px 0 10px; font-size: 22px; font-weight: 800; }
        .knownSecondary { margin-top: 13px; display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .knownSecondary input { padding: 4px 0 8px; font-size: 12px; }
        .orangeButton { min-height: 38px; padding: 0 15px; border: 0; background: #d66524; color: #fff8ee; cursor: pointer; font-size: 8px; font-weight: 900; letter-spacing: .12em; }
        .orangeButton:disabled { opacity: .35; cursor: default; }
        .knownTool > .orangeButton { margin-top: 16px; float: right; }

        .discoveryTool { left: 50%; bottom: 4.5%; width: min(900px, 88vw); padding: 15px 18px 13px; transform: translateX(-50%); }
        .discoveryRow { display: grid; grid-template-columns: minmax(220px, 1.2fr) minmax(330px, 1.7fr) auto; gap: 22px; align-items: end; }
        .originField select { padding: 8px 26px 8px 0; color-scheme: dark; font-size: 12px; cursor: pointer; }
        .rangeChoices { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
        .rangeChoices button { min-height: 34px; border: 1px solid rgba(255,255,255,.13); background: rgba(255,255,255,.025); color: rgba(255,255,255,.65); cursor: pointer; font-size: 7px; font-weight: 900; letter-spacing: .08em; }
        .rangeChoices button.selected { border-color: #d66524; background: rgba(214,101,36,.17); color: #f0a06a; }
        .findButton { white-space: nowrap; }
        .distanceNote { margin: 10px 0 0; color: rgba(255,255,255,.28); font-size: 6px; font-weight: 800; letter-spacing: .11em; }
        .toolError { margin: 8px 0 0; color: #e39a65; font-size: 9px; }

        .searchingTool { left: 50%; bottom: 7%; min-width: 390px; padding: 15px 18px; display: flex; align-items: center; gap: 14px; transform: translateX(-50%); }
        .searchMark { color: #d87935; animation: pulse 1.3s ease-in-out infinite; }
        .searchingTool strong { color: #e28a4e; font-size: 8px; letter-spacing: .16em; }
        .searchingTool p { margin: 5px 0 0; color: rgba(255,255,255,.5); font-size: 9px; }
        .errorTool { justify-content: space-between; gap: 28px; }
        .errorButtons { display: flex; gap: 16px; }
        @keyframes pulse { 50% { opacity: .35; transform: scale(.82); } }

        /*
         * WILD DESTINATION BRIEF V2
         * Coordinates follow destination-brief-v2.jpg's printed grid.
         */
        .briefSheet {
          position: fixed;
          z-index: 20;
          left: 50.55%;
          top: 20.35%;
          width: 37.05vw;
          height: 70.1vh;
          transform: translateX(-50%);
          color: #2c2922;
          font-family: Arial, Helvetica, sans-serif;
        }

        .briefMain,
        .briefContext,
        .assessmentPanel,
        .alternatives,
        .fieldNote,
        .briefFooter {
          position: absolute;
          box-sizing: border-box;
          background: transparent;
        }

        .briefMain {
          left: 0;
          top: 0;
          width: 59.2%;
          height: 53.7%;
          padding: 4.5% 5.2% 4%;
        }

        .mainTopline {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }
        .mainTopline > div { display: flex; align-items: baseline; gap: 9px; }
        .rankNumber {
          color: #aa5224;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(29px, 2.25vw, 38px);
          font-weight: 900;
          line-height: .9;
        }
        .rankStatus {
          color: #8a4a27;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .12em;
        }
        .changeBrief {
          padding: 0 0 3px;
          border: 0;
          border-bottom: 1px solid rgba(122,70,36,.35);
          background: transparent;
          color: #75451f;
          cursor: pointer;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .08em;
        }
        .sectionLabel, .panelLabel,
        .primaryMetrics span, .fitReason > span,
        .briefContext div > span {
          color: rgba(45,42,34,.57);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .11em;
        }
        .briefMain h1 {
          max-width: 100%;
          margin: 7px 0 15px;
          color: #24211c;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(23px, 1.9vw, 31px);
          line-height: 1.02;
          letter-spacing: -.025em;
        }
        .primaryMetrics {
          display: flex;
          gap: 34px;
          margin-bottom: 16px;
        }
        .primaryMetrics > div { display: flex; flex-direction: column; gap: 3px; }
        .primaryMetrics strong {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 16px;
        }
        .fitReason {
          padding-top: 12px;
          border-top: 1px solid rgba(48,44,35,.16);
        }
        .fitReason p {
          margin: 6px 0 0;
          display: -webkit-box;
          overflow: hidden;
          color: rgba(39,36,29,.78);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 11px;
          line-height: 1.42;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
        .activityBlock {
          margin-top: 10px;
          max-height: 38px;
          overflow: hidden;
        }
        .activityLine {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 6px;
        }
        .activityLine span {
          padding: 4px 6px;
          border: 1px solid rgba(63,57,45,.22);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .05em;
          text-transform: uppercase;
        }
        .selectPrimary {
          position: absolute;
          left: 5.2%;
          bottom: 15px;
          margin-top: 0;
          padding: 9px 12px;
          border: 0;
          background: #a95122;
          color: #fff8ec;
          cursor: pointer;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .08em;
        }
        .selectPrimary:hover { background: #8f431b; }

        .briefContext {
          left: 59.2%;
          top: 0;
          width: 40.8%;
          height: 8.6%;
          padding: 10px 14px 7px;
          display: grid;
          grid-template-columns: 1.35fr 1fr .65fr;
          gap: 9px;
          align-items: end;
        }
        .briefContext .panelLabel {
          position: absolute;
          left: 14px;
          top: 8px;
        }
        .briefContext div {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 2px;
          padding-top: 14px;
        }
        .briefContext div > span { font-size: 7px; }
        .briefContext strong {
          overflow: hidden;
          font-size: 10px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .assessmentPanel {
          left: 59.2%;
          top: 8.7%;
          width: 40.8%;
          height: 35.5%;
          padding: 16px 14px;
        }
        .assessmentList { margin-top: 14px; }
        .assessmentList p {
          margin: 0 0 10px;
          display: flex;
          gap: 7px;
          color: rgba(39,36,29,.78);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 10.5px;
          line-height: 1.38;
        }
        .assessmentList p span { color: #9a5129; font-weight: 900; }
        .assessmentPanel small {
          position: absolute;
          left: 14px;
          bottom: 12px;
          color: rgba(45,42,34,.42);
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .alternatives {
          left: 59.2%;
          top: 44.2%;
          width: 40.8%;
          height: 39.2%;
          padding: 14px;
        }
        .alternativesHeading {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .alternativesHeading > span {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .10em;
        }
        .alternativesHeading small {
          color: rgba(45,42,34,.48);
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .08em;
        }
        .alternativeList { border-top: 1px solid rgba(48,44,35,.18); }
        .alternativeRow {
          width: 100%;
          min-height: 31px;
          padding: 4px 2px;
          display: grid;
          grid-template-columns: 28px minmax(0,1fr) auto;
          gap: 7px;
          align-items: center;
          border: 0;
          border-bottom: 1px solid rgba(48,44,35,.14);
          background: transparent;
          color: #302d25;
          cursor: pointer;
          text-align: left;
        }
        .alternativeRow:hover,
        .alternativeRow.active { background: rgba(142,78,37,.07); }
        .altRank {
          color: #a95122;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 12px;
          font-weight: 900;
        }
        .altName {
          overflow: hidden;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 10px;
          font-weight: 700;
          line-height: 1.1;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .altMeta {
          color: #75451f;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .06em;
          white-space: nowrap;
        }

        .fieldNote {
          left: 0;
          top: 53.7%;
          width: 59.2%;
          height: 29.7%;
          padding: 18px 5.2%;
        }
        .fieldNote p {
          max-width: 88%;
          margin: 12px 0 0;
          color: rgba(39,36,29,.72);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 11px;
          line-height: 1.45;
        }

        .briefFooter {
          left: 0;
          top: 83.4%;
          width: 100%;
          height: 16.6%;
          padding: 18px 3.2%;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .briefFooter > div { display: flex; flex-direction: column; gap: 4px; }
        .briefFooter strong {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 13px;
          letter-spacing: .04em;
        }
        .briefFooter span {
          color: rgba(45,42,34,.52);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .10em;
        }


        /* V2 alignment pass 2 — keep live text clear of printed grid lines */
        .briefContext { top: 1.2%; height: 7.2%; padding: 9px 14px 5px; }
        .briefContext .panelLabel { top: 5px; }
        .briefContext div { padding-top: 12px; }
        .assessmentPanel { top: 10.2%; height: 33.4%; padding-top: 18px; }
        .alternatives { top: 45.7%; height: 34.7%; padding: 18px 14px 10px; }
        .alternativesHeading { margin-bottom: 10px; }
        .alternativeRow { min-height: 34px; }
        .briefMain { height: 53.7%; padding-bottom: 72px; }
        .fitReason { padding-top: 10px; }
        .fitReason p { margin-top: 8px; -webkit-line-clamp: 3; }
        .activityBlock { position: absolute; left: 5.2%; bottom: 52px; width: 89%; margin: 0; max-height: 30px; }
        .activityLine { margin-top: 5px; }
        .selectPrimary { left: 5.2%; bottom: 14px; margin: 0; }
        .fieldNote { top: 55.5%; height: 25.7%; padding: 22px 5.2% 14px; }
        .fieldNote p { margin-top: 12px; max-width: 88%; }
        .briefFooter { top: 83.8%; height: 16.2%; }


        /* V2 alignment pass 3 — fixes from the 07:48 screenshots */
        .changeBrief {
          transform: translateY(14px);
        }

        .briefContext {
          top: 3.0%;
          height: 6.7%;
          padding-top: 11px;
        }
        .briefContext .panelLabel {
          top: 8px;
        }
        .briefContext div {
          padding-top: 15px;
        }

        .assessmentPanel {
          top: 11.6%;
          height: 32.0%;
        }

        .fitReason {
          max-height: 68px;
          overflow: hidden;
        }
        .fitReason p {
          max-height: 46px;
          overflow: hidden;
          -webkit-line-clamp: 2;
        }

        .activityBlock {
          bottom: 58px;
          max-height: 31px;
          overflow: hidden;
          background: rgba(244, 239, 229, .92);
        }

        .selectPrimary {
          bottom: 12px;
          z-index: 3;
        }

        .fieldNote {
          top: 55.5%;
          padding-top: 26px;
        }

        /* Result-page cleanup: no Activities/CTA inside the paper */
        .briefMain { padding-bottom: 4%; }
        .fitReason { max-height: 160px; overflow: hidden; }
        .fitReason p {
          max-height: 118px;
          overflow: hidden;
          -webkit-line-clamp: 7;
        }
        .startWild:disabled { opacity: .65; cursor: default; }

        /* Final WILD CONTEXT label alignment */
        .briefContext .panelLabel {
          top: 18px;
        }

        /* Wild Match: display the internal weighted score as an understandable 1–5 star band */
        .wildMatchMetric {
          min-width: 118px;
        }
        .matchStars {
          display: block;
          margin-top: 2px;
          color: #a65325;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 18px !important;
          line-height: 1;
          letter-spacing: .035em;
          white-space: nowrap;
        }
        .matchStars i {
          color: rgba(45, 42, 34, .24);
          font-style: normal;
        }

        /* Stable 1–3 line destination title */
        .destinationTitleSlot { height: 82px; display: flex; align-items: flex-start; overflow: hidden; }
        .briefMain .destinationTitleSlot h1 { margin: 7px 0 0; display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
        .briefMain .destinationTitleSlot h1.longTitle { font-size: clamp(20px, 1.62vw, 27px); line-height: 1.02; }

        /* Interaction + header alignment fix only */
        .fitReason {
          position: relative;
          z-index: 8;
          overflow: visible;
        }
        .fitReason p {
          pointer-events: none;
        }
        .readAssessment {
          position: relative;
          z-index: 10;
          display: inline-block;
          pointer-events: auto;
        }

        /* Keep the nav and destination CTA inside one aligned header row */
        .destinationHeader {
          padding-left: 30px;
          padding-right: 30px;
        }
        .topNav {
          gap: 19px;
          flex-shrink: 0;
        }
        .topNav .startWild {
          min-height: 36px;
          padding: 0 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }

        /* Why This Fits stays inside its existing Brief cell */
        .fitReason p {
          display: -webkit-box;
          max-height: 31px;
          margin-bottom: 0;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        .readAssessment {
          margin-top: 5px;
          padding: 0 0 2px;
          border: 0;
          border-bottom: 1px solid rgba(140, 75, 37, .34);
          background: transparent;
          color: #8c4b25;
          cursor: pointer;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .08em;
          line-height: 1.2;
        }

        /* Expanded reading view; closes back to the same active destination */
        .assessmentModal {
          position: relative;
          width: min(610px, calc(100vw - 40px));
          max-height: calc(100vh - 80px);
          overflow: auto;
          padding: 34px 36px 30px;
          border: 1px solid rgba(185, 133, 79, .42);
          background: linear-gradient(
            rgba(241, 234, 218, .99),
            rgba(232, 222, 201, .99)
          );
          box-shadow: 0 22px 70px rgba(0, 0, 0, .42);
          color: #2a2720;
        }
        .assessmentModal h2 {
          margin: 10px 42px 22px 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 29px;
          line-height: 1.04;
        }
        .assessmentSectionLabel,
        .assessmentReasons > span {
          color: rgba(42, 39, 32, .50);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .11em;
        }
        .assessmentFullText {
          margin: 8px 0 0;
          color: rgba(42, 39, 32, .76);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 14px;
          line-height: 1.55;
        }
        .assessmentReasons {
          margin-top: 22px;
          padding: 17px 0;
          border-top: 1px solid rgba(65, 58, 45, .20);
          border-bottom: 1px solid rgba(65, 58, 45, .20);
        }
        .assessmentReasons p {
          margin: 10px 0 0;
          display: flex;
          gap: 8px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 13px;
          line-height: 1.35;
        }
        .assessmentReasons b {
          color: #9a5129;
        }
        .backToBrief {
          margin-top: 22px;
          min-height: 40px;
          padding: 0 14px;
          border: 1px solid rgba(65, 58, 45, .30);
          background: transparent;
          color: #4b4539;
          cursor: pointer;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .confirmMatchStars { color: #a65325; font-family: Georgia, "Times New Roman", serif; font-size: 15px !important; letter-spacing: .025em; white-space: nowrap; }
        .confirmMatchStars i { color: rgba(45,42,34,.24); font-style: normal; }

        /* Final destination confirmation */
        .confirmBackdrop { position: fixed; z-index: 100; inset: 0; display: grid; place-items: center; padding: 24px; background: rgba(10,9,7,.68); backdrop-filter: blur(3px); }
        .confirmModal { position: relative; width: min(560px, calc(100vw - 40px)); padding: 34px 36px 30px; border: 1px solid rgba(185,133,79,.42); background: linear-gradient(rgba(241,234,218,.98),rgba(232,222,201,.98)); box-shadow: 0 22px 70px rgba(0,0,0,.42); color: #2a2720; }
        .confirmClose { position: absolute; top: 14px; right: 16px; width: 34px; height: 34px; border: 0; background: transparent; color: rgba(42,39,32,.65); cursor: pointer; font-size: 25px; }
        .confirmEyebrow { color: #995126; font-size: 10px; font-weight: 900; letter-spacing: .16em; }
        .confirmModal h2 { margin: 10px 42px 12px 0; font-family: Georgia,"Times New Roman",serif; font-size: 30px; line-height: 1.03; }
        .confirmIntro { max-width: 470px; margin: 0; color: rgba(42,39,32,.70); font-family: Georgia,"Times New Roman",serif; font-size: 14px; line-height: 1.5; }
        .confirmFacts { margin-top: 24px; padding: 17px 0; display: grid; grid-template-columns: 1.45fr .8fr .55fr; gap: 18px; border-top: 1px solid rgba(65,58,45,.20); border-bottom: 1px solid rgba(65,58,45,.20); }
        .confirmFacts div { display: flex; flex-direction: column; gap: 5px; }
        .confirmFacts span { color: rgba(42,39,32,.48); font-size: 9px; font-weight: 900; letter-spacing: .10em; }
        .confirmFacts strong { font-size: 13px; line-height: 1.25; }
        .confirmActions { margin-top: 24px; display: flex; justify-content: flex-end; gap: 10px; }
        .keepExploring,.confirmDestination { min-height: 42px; padding: 0 15px; cursor: pointer; font-size: 10px; font-weight: 900; letter-spacing: .08em; }
        .keepExploring { border: 1px solid rgba(65,58,45,.30); background: transparent; color: #4b4539; }
        .confirmDestination { border: 1px solid #9b4d21; background: #a95122; color: #fff8ec; }
        .confirmDestination:hover { background: #8f431b; }

        /* Desktop header: keep the complete destination CTA inside the viewport */
        @media (min-width: 901px) {
          .destinationHeader {
            box-sizing: border-box;
            width: 100%;
            padding-left: 34px;
            padding-right: 34px;
          }
          .headerLeft {
            flex: 0 1 auto;
            min-width: 0;
          }
          .topNav {
            margin-left: auto;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 18px;
            min-width: 0;
          }
          .topNav .startWild {
            flex: 0 0 auto;
            margin-left: 4px;
            max-width: none;
            padding-left: 15px;
            padding-right: 15px;
            white-space: nowrap;
          }
        }

        /* Stepwise Brief refactor: release the existing right-upper assessment cell only */
        .assessmentPanel {
          color: transparent;
        }
        .assessmentPanel > * {
          visibility: hidden;
        }
        .assessmentPanel::before {
          content: "TOPOGRAPHIC OVERVIEW";
          visibility: visible;
          display: block;
          color: rgba(45, 42, 34, .52);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .10em;
        }
        .assessmentPanel::after {
          content: "LIVE TERRAIN DATA · RESERVED";
          visibility: visible;
          position: absolute;
          left: 14px;
          bottom: 14px;
          color: rgba(45, 42, 34, .34);
          font-size: 6px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        /* FINAL desktop header rule: viewport is the coordinate system, not the background image */
        @media (min-width: 901px) {
          .destinationHeader {
            position: fixed;
            z-index: 80;
            top: 0;
            left: 0;
            right: 0;
            width: auto;
            height: 58px;
            margin: 0;
            padding: 0 24px 0 34px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            overflow: visible;
          }
          .headerLeft {
            flex: 0 1 auto;
            min-width: 0;
          }
          .topNav {
            flex: 0 0 auto;
            margin: 0 0 0 auto;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 18px;
            min-width: 0;
          }
          .topNav .startWild {
            flex: 0 0 auto;
            margin: 0;
            min-height: 38px;
            padding: 0 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            white-space: nowrap;
          }
        }

        @media (max-width: 900px) {
          .destinationHeader { padding: 0 18px; }
          .brandSub, .topNav button:not(.startWild) { display: none; }
          .topNav { gap: 8px; }
          .progressWrap { width: calc(100vw - 36px); bottom: 10px; }
          .boardStage { width: 100vw; height: calc(100vh - 90px); margin-left: calc(50% - 50vw); min-height: 650px; }
          .discoveryRow { grid-template-columns: 1fr; gap: 12px; }
          .discoveryTool { bottom: 8%; }
          .rangeChoices { grid-template-columns: repeat(4, 1fr); }
          .entryTools { bottom: 10%; }

          .briefSheet {
            left: 50.55%;
            top: 20.35%;
            width: 55.5vw;
            height: 68vh;
          }
          .briefMain h1 { font-size: clamp(18px, 3vw, 25px); }
          .fitReason p, .fieldNote p { font-size: 9px; }
          .assessmentList p { font-size: 8.5px; }
          .altName { font-size: 8px; }
          .alternativeRow { min-height: 26px; }
        }
      `}</style>
    </main>
  );
}
