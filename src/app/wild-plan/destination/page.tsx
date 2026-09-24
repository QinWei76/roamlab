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
            <div className="resultTool">
              <div><span>STARTING FROM</span><strong>{selectedOrigin ? getOriginLocationLabel(selectedOrigin) : "—"}</strong></div>
              <div><span>RANGE</span><strong>{travelRadius === "anywhere" ? "Anywhere" : `~${travelRadius} km`}</strong></div>
              <div><span>FOUND</span><strong>{matches.length.toString().padStart(2, "0")} PLACES</strong></div>
              <button type="button" onClick={editDiscovery}>CHANGE START / RANGE</button>
            </div>

            {matches.slice(0, 5).map((match, index) => (
              <button type="button" key={`${match.source}-${match.sourceId}`} className={`polaroidHit polaroidHit${index + 1}`} onClick={() => selectDiscoveredDestination(match)} aria-label={`Choose ${match.name}`}>
                <span className="photoNumber">{(index + 1).toString().padStart(2, "0")}</span>
                <span className="photoCaption">
                  <strong>{match.name}</strong>
                  {typeof match.distanceKm === "number" && <small>{Math.round(match.distanceKm).toLocaleString()} KM FROM START</small>}
                  <em>CHOOSE →</em>
                </span>
              </button>
            ))}
          </>
        )}
      </section>

      <style jsx>{`
        :global(html), :global(body) { margin: 0; background: #0a0907; }
        .destinationPage { position: relative; min-height: 100vh; overflow: hidden; color: #f6f0e5; background: #0a0907; font-family: Arial, Helvetica, sans-serif; }
        .scene { position: fixed; inset: 0; z-index: 0; background: url("/destination-board.jpg") center center / cover no-repeat; }
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
        .progressWrap { position: relative; z-index: 20; width: min(890px, calc(100vw - 220px)); margin: 30px auto 0; }
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

        .resultTool { left: 50%; top: 92px; width: min(780px, 76vw); padding: 10px 14px; display: grid; grid-template-columns: 1.3fr .8fr .7fr auto; gap: 18px; align-items: center; transform: translateX(-50%); }
        .resultTool div { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .resultTool span { color: rgba(255,255,255,.36); font-size: 6px; font-weight: 900; letter-spacing: .14em; }
        .resultTool strong { overflow: hidden; color: rgba(255,255,255,.82); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }

        .polaroidHit { position: absolute; z-index: 15; padding: 0; border: 0; background: transparent; color: #241e17; cursor: pointer; text-align: left; transform-origin: center; transition: filter .16s ease, transform .16s ease; }
        .polaroidHit:hover { z-index: 19; filter: drop-shadow(0 10px 9px rgba(0,0,0,.34)); }
        .polaroidHit1 { left: 12.5%; top: 25.5%; width: 17.3%; height: 25.5%; transform: rotate(-4deg); }
        .polaroidHit2 { left: 67.2%; top: 26.5%; width: 17.2%; height: 25.5%; transform: rotate(4deg); }
        .polaroidHit3 { left: 42.1%; top: 52.5%; width: 18.1%; height: 28.5%; transform: rotate(1deg); }
        .polaroidHit4 { left: 9.0%; top: 54.5%; width: 18.0%; height: 29%; transform: rotate(4deg); }
        .polaroidHit5 { left: 72.0%; top: 54.5%; width: 17.8%; height: 29%; transform: rotate(5deg); }
        .polaroidHit1:hover { transform: rotate(-4deg) translateY(-3px) scale(1.015); }
        .polaroidHit2:hover { transform: rotate(4deg) translateY(-3px) scale(1.015); }
        .polaroidHit3:hover { transform: rotate(1deg) translateY(-3px) scale(1.015); }
        .polaroidHit4:hover { transform: rotate(4deg) translateY(-3px) scale(1.015); }
        .polaroidHit5:hover { transform: rotate(5deg) translateY(-3px) scale(1.015); }
        .photoNumber { position: absolute; left: 8%; top: 7%; width: 21px; height: 21px; display: grid; place-items: center; border-radius: 50%; background: rgba(35,29,22,.87); color: #f6ead0; font-size: 6px; font-weight: 900; }
        .photoCaption { position: absolute; left: 8%; right: 8%; bottom: 5%; min-height: 26%; display: flex; flex-direction: column; justify-content: flex-end; }
        .photoCaption strong { display: -webkit-box; overflow: hidden; color: #2b251e; font-family: Georgia, "Times New Roman", serif; font-size: clamp(9px, .9vw, 14px); line-height: 1.03; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
        .photoCaption small { margin-top: 4px; color: rgba(43,37,30,.58); font-size: 6px; font-weight: 800; letter-spacing: .05em; }
        .photoCaption em { margin-top: 4px; color: #7b4c23; font-size: 6px; font-style: normal; font-weight: 900; letter-spacing: .08em; opacity: 0; }
        .polaroidHit:hover .photoCaption em { opacity: 1; }

        @media (max-width: 900px) {
          .destinationHeader { padding: 0 18px; }
          .brandSub, .topNav button:not(.startWild) { display: none; }
          .topNav { gap: 8px; }
          .progressWrap { width: calc(100vw - 36px); margin-top: 18px; }
          .boardStage { width: 100vw; height: calc(100vh - 110px); margin-left: calc(50% - 50vw); min-height: 600px; }
          .discoveryRow { grid-template-columns: 1fr; gap: 12px; }
          .discoveryTool { bottom: 2%; }
          .rangeChoices { grid-template-columns: repeat(4, 1fr); }
          .resultTool { top: 82px; grid-template-columns: 1fr 1fr; }
          .resultTool button { text-align: left; }
          .entryTools { bottom: 4%; }
        }
      `}</style>
    </main>
  );
}
