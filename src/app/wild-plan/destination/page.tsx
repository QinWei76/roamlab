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
          <button type="button" className="startWild" onClick={() => router.push("/ways-in")}>START YOUR WILD →</button>
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

        {!discovering && matches.length > 0 && (
          <>
            <div className="briefSheet">
              <div className="briefContext">
                <button type="button" className="changeBrief" onClick={editDiscovery}>
                  CHANGE START / RANGE
                </button>
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
              </div>

              {matches[0] && (
                <section className="primaryMatch">
                  <div className="rankBlock">
                    <span>01</span>
                    <small>BEST MATCH</small>
                  </div>

                  <div className="primaryBody">
                    <span className="sectionLabel">RECOMMENDED DESTINATION</span>
                    <h1>{matches[0].name}</h1>

                    <div className="primaryMetrics">
                      {typeof matches[0].matchScore === "number" && (
                        <div>
                          <span>MATCH SCORE</span>
                          <strong>{Math.round(matches[0].matchScore)}</strong>
                        </div>
                      )}
                      {typeof matches[0].distanceKm === "number" && (
                        <div>
                          <span>DISTANCE</span>
                          <strong>{Math.round(matches[0].distanceKm).toLocaleString()} KM</strong>
                        </div>
                      )}
                    </div>

                    <div className="fitReason">
                      <span>WHY IT FITS</span>
                      <p>
                        {matches[0].whyItFits ||
                          matches[0].matchReasons?.slice(0, 3).join(" · ") ||
                          "Strong alignment with your current Wild setup."}
                      </p>
                    </div>

                    {matches[0].activities && matches[0].activities.length > 0 && (
                      <div className="activityLine">
                        {matches[0].activities.slice(0, 4).map((activity) => (
                          <span key={activity}>{activity}</span>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      className="selectPrimary"
                      onClick={() => selectDiscoveredDestination(matches[0])}
                    >
                      SELECT THIS DESTINATION →
                    </button>
                  </div>
                </section>
              )}

              <section className="alternatives">
                <div className="alternativesHeading">
                  <span>ALTERNATIVE MATCHES</span>
                  <small>RANKED FOR THIS WILD</small>
                </div>

                <div className="alternativeList">
                  {matches.slice(1, 5).map((match, index) => (
                    <button
                      type="button"
                      key={`${match.source}-${match.sourceId}`}
                      className="alternativeRow"
                      onClick={() => selectDiscoveredDestination(match)}
                    >
                      <span className="altRank">{String(index + 2).padStart(2, "0")}</span>
                      <span className="altName">{match.name}</span>
                      <span className="altDistance">
                        {typeof match.distanceKm === "number"
                          ? `${Math.round(match.distanceKm).toLocaleString()} KM`
                          : "—"}
                      </span>
                      <span className="altScore">
                        {typeof match.matchScore === "number"
                          ? `${Math.round(match.matchScore)} MATCH`
                          : "VIEW"}
                      </span>
                      <span className="altArrow">→</span>
                    </button>
                  ))}
                </div>
              </section>

              <div className="briefFooter">
                <span>DESTINATION STATUS · REVIEW</span>
                <span>GEOGRAPHIC DISTANCE · NOT DRIVING ROUTE DISTANCE</span>
              </div>
            </div>
          </>
        )}
      </section>

      <style jsx>{`
        :global(html), :global(body) { margin: 0; background: #0a0907; }
        .destinationPage { position: relative; min-height: 100vh; overflow: hidden; color: #f6f0e5; background: #0a0907; font-family: Arial, Helvetica, sans-serif; }
        .scene { position: fixed; inset: 0; z-index: 0; background: url("/destination-brief.jpg") center center / cover no-repeat; }
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
         * DESTINATION BRIEF ALIGNMENT
         * The background artwork is 16:9. The live content is deliberately
         * constrained to the printed inner sheet instead of using a free-floating card.
         */
        .briefSheet {
          position: fixed;
          z-index: 20;
          left: 50.65%;
          top: 18.55%;
          width: 38.55vw;
          height: 69.7vh;
          padding: 0;
          box-sizing: border-box;
          transform: translateX(-50%);
          color: #292720;
          background: transparent;
          font-family: Arial, Helvetica, sans-serif;
        }

        .briefContext {
          position: relative;
          height: 16.5%;
          display: grid;
          grid-template-columns: 1.55fr 1fr .55fr;
          gap: 14px;
          align-items: end;
          padding: 0 2.8% 3.2%;
          box-sizing: border-box;
          border-bottom: 1px solid rgba(48,44,35,.22);
        }
        .changeBrief {
          position: absolute;
          right: 2.8%;
          top: 8%;
          padding: 0 0 3px;
          border: 0;
          border-bottom: 1px solid rgba(112,67,31,.38);
          background: transparent;
          color: #75451f;
          cursor: pointer;
          font-size: 5px;
          font-weight: 900;
          letter-spacing: .12em;
        }
        .briefContext > div { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .briefContext span, .primaryMetrics span, .fitReason > span {
          color: rgba(45,42,34,.50);
          font-size: 5px;
          font-weight: 900;
          letter-spacing: .14em;
        }
        .briefContext strong {
          overflow: hidden;
          color: #302d25;
          font-size: 8px;
          font-weight: 900;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .primaryMatch {
          height: 47%;
          display: grid;
          grid-template-columns: 15% 1fr;
          gap: 3.5%;
          padding: 4.2% 3% 3.6%;
          box-sizing: border-box;
          border-bottom: 1px solid rgba(48,44,35,.28);
        }
        .rankBlock {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding-top: 1px;
        }
        .rankBlock > span {
          color: #b45d27;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(25px,2.25vw,35px);
          font-weight: 900;
          line-height: .9;
        }
        .rankBlock small {
          margin-top: 6px;
          color: #75451f;
          font-size: 5px;
          font-weight: 900;
          letter-spacing: .1em;
        }
        .primaryBody { min-width: 0; }
        .sectionLabel {
          color: rgba(45,42,34,.48);
          font-size: 5px;
          font-weight: 900;
          letter-spacing: .15em;
        }
        .primaryBody h1 {
          max-width: 100%;
          margin: 4px 0 8px;
          color: #24221c;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(16px,1.55vw,24px);
          line-height: 1.02;
          letter-spacing: -.02em;
        }
        .primaryMetrics { display: flex; gap: 28px; margin-bottom: 8px; }
        .primaryMetrics > div { display: flex; flex-direction: column; gap: 1px; }
        .primaryMetrics strong {
          color: #2b2922;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 12px;
        }
        .fitReason {
          max-width: 100%;
          padding-top: 7px;
          border-top: 1px solid rgba(48,44,35,.14);
        }
        .fitReason p {
          margin: 3px 0 0;
          display: -webkit-box;
          overflow: hidden;
          color: rgba(39,36,29,.74);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 7px;
          line-height: 1.32;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
        .activityLine {
          margin-top: 7px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .activityLine span {
          padding: 3px 5px;
          border: 1px solid rgba(63,57,45,.18);
          color: rgba(48,44,35,.65);
          font-size: 4px;
          font-weight: 900;
          letter-spacing: .07em;
          text-transform: uppercase;
        }
        .selectPrimary {
          margin-top: 8px;
          padding: 7px 10px;
          border: 0;
          background: #a95122;
          color: #fff7e8;
          cursor: pointer;
          font-size: 5px;
          font-weight: 900;
          letter-spacing: .11em;
        }
        .selectPrimary:hover { background: #8f431b; }

        .alternatives {
          height: 28.5%;
          padding: 2.8% 3% 0;
          box-sizing: border-box;
        }
        .alternativesHeading {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding-bottom: 4px;
        }
        .alternativesHeading > span {
          color: #37332a;
          font-size: 5px;
          font-weight: 900;
          letter-spacing: .14em;
        }
        .alternativesHeading small {
          color: rgba(45,42,34,.42);
          font-size: 4px;
          font-weight: 900;
          letter-spacing: .11em;
        }
        .alternativeList { border-top: 1px solid rgba(48,44,35,.22); }
        .alternativeRow {
          width: 100%;
          height: 24px;
          padding: 0 1px;
          display: grid;
          grid-template-columns: 28px minmax(0,1fr) 58px 58px 9px;
          gap: 6px;
          align-items: center;
          border: 0;
          border-bottom: 1px solid rgba(48,44,35,.15);
          background: transparent;
          color: #302d25;
          cursor: pointer;
          text-align: left;
        }
        .alternativeRow:hover { background: rgba(112,67,31,.05); }
        .altRank {
          color: #a95122;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 10px;
          font-weight: 900;
        }
        .altName {
          overflow: hidden;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 7px;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .altDistance, .altScore {
          color: rgba(45,42,34,.55);
          font-size: 4px;
          font-weight: 900;
          letter-spacing: .06em;
          text-align: right;
        }
        .altScore { color: #75451f; }
        .altArrow { color: #a95122; font-size: 8px; text-align: right; }

        .briefFooter {
          position: absolute;
          left: 3%;
          right: 3%;
          bottom: 1.8%;
          padding-top: 5px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          border-top: 1px solid rgba(48,44,35,.24);
          color: rgba(45,42,34,.43);
          font-size: 4px;
          font-weight: 900;
          letter-spacing: .09em;
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
            left: 50.6%;
            top: 18.5%;
            width: 57vw;
            height: 68vh;
          }
          .primaryMatch { grid-template-columns: 14% 1fr; gap: 3%; }
          .primaryBody h1 { font-size: clamp(14px,2.5vw,20px); }
          .alternativeRow {
            grid-template-columns: 24px minmax(0,1fr) 48px 48px 8px;
            gap: 4px;
          }
        }
      `}</style>
    </main>
  );
}
