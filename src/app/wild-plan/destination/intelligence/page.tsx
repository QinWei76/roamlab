"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  getCurrentWild,
} from "@/lib/wildStore";

function numberParam(
  value: string | null
) {
  if (!value) return null;

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function formatDuration(
  minutes: number
) {
  const rounded = Math.max(
    1,
    Math.round(minutes)
  );

  const hours = Math.floor(
    rounded / 60
  );

  const mins =
    rounded % 60;

  if (hours === 0) {
    return `${mins} MIN`;
  }

  if (mins === 0) {
    return `${hours} HR`;
  }

  return `${hours} HR ${mins} MIN`;
}

type WeatherDay = {
  date: string;
  code: number;
  tempMax: number;
  tempMin: number;
  precipitationMm: number;
  precipitationProbability: number | null;
  windMaxKmh: number;
};

type WeatherSnapshot = {
  timezone: string;
  currentTemperature: number | null;
  apparentTemperature: number | null;
  currentCode: number | null;
  currentWindKmh: number | null;
  days: WeatherDay[];
};

type WildScheduleSnapshot = {
  startDate?: string;
  endDate?: string;
  timingMode?: "exact" | "flexible" | "undecided";
  durationType?: string;
  days?: number;
  nights?: number;
  flexibleDates?: boolean;
};

function formatTripDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
}

function calendarDatesBetween(
  startDate: string,
  endDate: string
) {
  const startParts = startDate.split("-").map(Number);
  const endParts = endDate.split("-").map(Number);

  if (
    startParts.length !== 3 ||
    endParts.length !== 3 ||
    startParts.some((value) => !Number.isFinite(value)) ||
    endParts.some((value) => !Number.isFinite(value))
  ) {
    return [];
  }

  const cursor = new Date(
    Date.UTC(
      startParts[0],
      startParts[1] - 1,
      startParts[2]
    )
  );

  const end = new Date(
    Date.UTC(
      endParts[0],
      endParts[1] - 1,
      endParts[2]
    )
  );

  if (end.getTime() < cursor.getTime()) {
    return [];
  }

  const result: string[] = [];

  while (cursor.getTime() <= end.getTime()) {
    result.push(
      cursor.toISOString().slice(0, 10)
    );

    cursor.setUTCDate(
      cursor.getUTCDate() + 1
    );
  }

  return result;
}

function weatherLabel(code: number | null) {
  if (code === null) return "UNKNOWN";
  if (code === 0) return "CLEAR";
  if ([1, 2].includes(code)) return "PARTLY CLOUDY";
  if (code === 3) return "OVERCAST";
  if ([45, 48].includes(code)) return "FOG";
  if ([51, 53, 55, 56, 57].includes(code)) return "DRIZZLE";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "RAIN";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "SNOW";
  if ([95, 96, 99].includes(code)) return "THUNDERSTORM";
  return "VARIABLE";
}

function shortDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
}

function DestinationIntelligenceContent() {
  const router =
    useRouter();

  const params =
    useSearchParams();

  const name =
    params.get("name") ||
    "Destination";

  const source =
    params.get("source") ||
    "RIDB";

  const sourceId =
    params.get("sourceId") ||
    "—";

  const latitude =
    numberParam(
      params.get("lat")
    );

  const longitude =
    numberParam(
      params.get("lon")
    );

  const distanceKm =
    numberParam(
      params.get("distance")
    );

  const matchScore =
    numberParam(
      params.get("score")
    );

  const returnMatch =
    params.get("returnMatch") ||
    "0";

  const originLabel =
    params.get("origin") ||
    "Starting point";

  const originLatitude =
    numberParam(
      params.get(
        "originLat"
      )
    );

  const originLongitude =
    numberParam(
      params.get(
        "originLon"
      )
    );

  const [
    activeSection,
    setActiveSection,
  ] = useState<"overview" | "weather">("overview");

  const [
    weather,
    setWeather,
  ] = useState<WeatherSnapshot | null>(null);

  const [
    weatherStatus,
    setWeatherStatus,
  ] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");

  const [
    wildSchedule,
    setWildSchedule,
  ] = useState<WildScheduleSnapshot | null>(null);

  useEffect(() => {
    const currentWild =
      getCurrentWild();

    setWildSchedule(
      currentWild?.plan?.adventure?.schedule
        ? {
            ...currentWild.plan.adventure.schedule,
          }
        : null
    );
  }, []);

  const mapRef =
    useRef<any>(null);

  const [
    routeDistanceKm,
    setRouteDistanceKm,
  ] = useState<
    number | null
  >(null);

  const [
    routeDurationMin,
    setRouteDurationMin,
  ] = useState<
    number | null
  >(null);

  const [
    routeStatus,
    setRouteStatus,
  ] = useState<
    | "idle"
    | "loading"
    | "ready"
    | "unavailable"
  >("idle");

  useEffect(() => {
    if (latitude === null || longitude === null) {
      setWeatherStatus("unavailable");
      return;
    }

    let cancelled = false;
    setWeatherStatus("loading");
    setWeather(null);

    const weatherUrl =
      "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max" +
      "&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm" +
      "&forecast_days=7&timezone=auto";

    fetch(weatherUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Weather request failed");
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        const times = Array.isArray(data?.daily?.time) ? data.daily.time : [];
        const days: WeatherDay[] = times.map((date: string, index: number) => ({
          date,
          code: Number(data?.daily?.weather_code?.[index] ?? -1),
          tempMax: Number(data?.daily?.temperature_2m_max?.[index] ?? 0),
          tempMin: Number(data?.daily?.temperature_2m_min?.[index] ?? 0),
          precipitationMm: Number(data?.daily?.precipitation_sum?.[index] ?? 0),
          precipitationProbability:
            typeof data?.daily?.precipitation_probability_max?.[index] === "number"
              ? data.daily.precipitation_probability_max[index]
              : null,
          windMaxKmh: Number(data?.daily?.wind_speed_10m_max?.[index] ?? 0),
        }));

        setWeather({
          timezone: data?.timezone || "LOCAL",
          currentTemperature: typeof data?.current?.temperature_2m === "number" ? data.current.temperature_2m : null,
          apparentTemperature: typeof data?.current?.apparent_temperature === "number" ? data.current.apparent_temperature : null,
          currentCode: typeof data?.current?.weather_code === "number" ? data.current.weather_code : null,
          currentWindKmh: typeof data?.current?.wind_speed_10m === "number" ? data.current.wind_speed_10m : null,
          days,
        });
        setWeatherStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("RoamLab weather request failed:", error);
        setWeatherStatus("unavailable");
      });

    return () => { cancelled = true; };
  }, [latitude, longitude]);

  useEffect(() => {
    if (
      latitude === null ||
      longitude === null ||
      originLatitude ===
        null ||
      originLongitude ===
        null
    ) {
      setRouteStatus(
        "unavailable"
      );

      return;
    }

    let cancelled =
      false;

    setRouteStatus(
      "loading"
    );

    setRouteDistanceKm(
      null
    );

    setRouteDurationMin(
      null
    );

    async function loadRoute() {
      //
      // 01 · LOAD LEAFLET CSS
      //

      if (
        !document.querySelector(
          'link[data-roamlab-leaflet="true"]'
        )
      ) {
        const link =
          document.createElement(
            "link"
          );

        link.rel =
          "stylesheet";

        link.href =
          "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

        link.setAttribute(
          "data-roamlab-leaflet",
          "true"
        );

        document.head.appendChild(
          link
        );
      }

      //
      // 02 · LOAD LEAFLET JS
      //

      if (!(window as any).L) {
        await new Promise<void>(
          (
            resolve,
            reject
          ) => {
            const existing =
              document.querySelector(
                'script[data-roamlab-leaflet="true"]'
              ) as
                | HTMLScriptElement
                | null;

            if (existing) {
              if (
                (window as any)
                  .L
              ) {
                resolve();
                return;
              }

              existing.addEventListener(
                "load",
                () =>
                  resolve(),
                {
                  once: true,
                }
              );

              existing.addEventListener(
                "error",
                () =>
                  reject(
                    new Error(
                      "Leaflet failed to load"
                    )
                  ),
                {
                  once: true,
                }
              );

              return;
            }

            const script =
              document.createElement(
                "script"
              );

            script.src =
              "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

            script.async =
              true;

            script.setAttribute(
              "data-roamlab-leaflet",
              "true"
            );

            script.onload =
              () =>
                resolve();

            script.onerror =
              () =>
                reject(
                  new Error(
                    "Leaflet failed to load"
                  )
                );

            document.body.appendChild(
              script
            );
          }
        );
      }

      //
      // 03 · CALCULATE ROAD ROUTE
      //

      const routeUrl =
        "https://router.project-osrm.org/route/v1/driving/" +
        `${originLongitude},${originLatitude};` +
        `${longitude},${latitude}` +
        "?overview=full" +
        "&geometries=geojson" +
        "&steps=false" +
        "&alternatives=false";

      const response =
        await fetch(
          routeUrl
        );

      if (!response.ok) {
        throw new Error(
          "Road route request failed"
        );
      }

      const data =
        await response.json();

      const route =
        data?.routes?.[0];

      if (
        data?.code !==
          "Ok" ||
        !route ||
        typeof route.distance !==
          "number" ||
        typeof route.duration !==
          "number"
      ) {
        throw new Error(
          "Road route unavailable"
        );
      }

      if (cancelled) {
        return;
      }

      //
      // 04 · ROUTE DATA IS VALID
      //

      setRouteDistanceKm(
        route.distance /
          1000
      );

      setRouteDurationMin(
        route.duration /
          60
      );

      //
      // IMPORTANT:
      //
      // At this point the road
      // route calculation has
      // succeeded.
      //

      setRouteStatus(
        "ready"
      );

      //
      // 05 · GET ROUTE GEOMETRY
      //

      const coordinates =
        route?.geometry
          ?.coordinates;

      if (
        !Array.isArray(
          coordinates
        ) ||
        coordinates.length <
          2
      ) {
        console.warn(
          "RoamLab: route calculated but geometry is unavailable."
        );

        return;
      }

      //
      // 06 · GET LEAFLET
      //

      const L =
        (window as any).L;

      const node =
        document.getElementById(
          "destination-intelligence-map"
        );

      if (!L || !node) {
        console.warn(
          "RoamLab: route calculated but map container is unavailable."
        );

        return;
      }

      //
      // 07 · REMOVE OLD MAP
      //

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {
          // ignore
        }

        mapRef.current =
          null;
      }

      if (
        (node as any)
          ._leaflet_id
      ) {
        delete (
          node as any
        )._leaflet_id;
      }

      let map: any =
        null;

      try {
        //
        // 08 · CREATE MAP
        //

        map = L.map(
          node,
          {
            zoomControl:
              true,

            attributionControl:
              true,

            minZoom: 3,

            maxZoom: 18,
          }
        );

        //
        // 09 · BASE MAP
        //

        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            minZoom: 0,

            maxZoom: 19,

            attribution:
              "© OpenStreetMap contributors",
          }
        ).addTo(map);

        //
        // 10 · CONVERT OSRM
        //      COORDINATES
        //
        // OSRM GeoJSON:
        // [longitude, latitude]
        //
        // Leaflet:
        // [latitude, longitude]
        //

        const routeLatLngs =
          coordinates
            .filter(
              (
                coordinate: unknown
              ) =>
                Array.isArray(
                  coordinate
                ) &&
                coordinate.length >=
                  2 &&
                typeof coordinate[0] ===
                  "number" &&
                typeof coordinate[1] ===
                  "number"
            )
            .map(
              (
                coordinate: number[]
              ) => [
                coordinate[1],
                coordinate[0],
              ]
            );

        if (
          routeLatLngs.length <
          2
        ) {
          console.warn(
            "RoamLab: route geometry has too few valid coordinates."
          );

          return;
        }

        //
        // 11 · ROUTE SHADOW
        //

        L.polyline(
          routeLatLngs,
          {
            color:
              "#f5ead8",

            weight: 9,

            opacity: 0.92,

            lineCap:
              "round",

            lineJoin:
              "round",

            interactive:
              false,
          }
        ).addTo(map);

        //
        // 12 · MAIN ROUTE
        //

        const routeLine =
          L.polyline(
            routeLatLngs,
            {
              color:
                "#a65328",

              weight: 5,

              opacity: 1,

              lineCap:
                "round",

              lineJoin:
                "round",

              interactive:
                false,
            }
          ).addTo(map);

        //
        // 13 · START MARKER
        //

        L.circleMarker(
          [
            originLatitude,
            originLongitude,
          ],
          {
            radius: 8,

            color:
              "#f4ecdc",

            weight: 3,

            fillColor:
              "#304b39",

            fillOpacity: 1,
          }
        )
          .bindTooltip(
            "START",
            {
              permanent:
                false,

              direction:
                "top",

              offset: [
                0,
                -6,
              ],
            }
          )
          .addTo(map);

        //
        // 14 · DESTINATION
        //

        L.circleMarker(
          [
            latitude,
            longitude,
          ],
          {
            radius: 9,

            color:
              "#f4ecdc",

            weight: 3,

            fillColor:
              "#a65328",

            fillOpacity: 1,
          }
        )
          .bindTooltip(
            "DESTINATION",
            {
              permanent:
                false,

              direction:
                "top",

              offset: [
                0,
                -7,
              ],
            }
          )
          .addTo(map);

        //
        // 15 · FIT REAL ROUTE
        //

        const routeBounds =
          routeLine.getBounds();

        if (
          routeBounds &&
          routeBounds.isValid()
        ) {
          map.fitBounds(
            routeBounds,
            {
              paddingTopLeft: [
                44,
                56,
              ],

              paddingBottomRight:
                [
                  44,
                  44,
                ],

              maxZoom: 13,
            }
          );
        } else {
          map.fitBounds(
            [
              [
                originLatitude,
                originLongitude,
              ],

              [
                latitude,
                longitude,
              ],
            ],
            {
              padding: [
                44,
                44,
              ],

              maxZoom: 13,
            }
          );
        }

        //
        // 16 · FIT ROUTE BUTTON
        //

        const routeControl =
          L.control({
            position:
              "topleft",
          });

        routeControl.onAdd =
          () => {
            const button =
              L.DomUtil.create(
                "button",
                "roamlabIntelligenceCenter"
              );

            button.type =
              "button";

            button.innerHTML =
              "FIT ROUTE";

            button.title =
              "Show full road route";

            L.DomEvent.disableClickPropagation(
              button
            );

            L.DomEvent.disableScrollPropagation(
              button
            );

            L.DomEvent.on(
              button,
              "click",
              () => {
                const bounds =
                  routeLine.getBounds();

                if (
                  bounds &&
                  bounds.isValid()
                ) {
                  map.fitBounds(
                    bounds,
                    {
                      paddingTopLeft:
                        [
                          44,
                          56,
                        ],

                      paddingBottomRight:
                        [
                          44,
                          44,
                        ],

                      maxZoom:
                        13,
                    }
                  );
                }
              }
            );

            return button;
          };

        routeControl.addTo(
          map
        );

        mapRef.current =
          map;

        //
        // 17 · RESIZE FIX
        //

        window.setTimeout(
          () => {
            if (
              cancelled ||
              !mapRef.current
            ) {
              return;
            }

            map.invalidateSize(
              false
            );

            const bounds =
              routeLine.getBounds();

            if (
              bounds &&
              bounds.isValid()
            ) {
              map.fitBounds(
                bounds,
                {
                  paddingTopLeft:
                    [
                      44,
                      56,
                    ],

                  paddingBottomRight:
                    [
                      44,
                      44,
                    ],

                  maxZoom:
                    13,
                }
              );
            }
          },
          180
        );
      } catch (
        mapError
      ) {
        //
        // Do NOT change
        // routeStatus here.
        //
        // The actual route
        // calculation already
        // succeeded.
        //

        console.error(
          "RoamLab route map rendering failed:",
          mapError
        );

        if (map) {
          try {
            map.remove();
          } catch {
            // ignore
          }
        }

        mapRef.current =
          null;
      }
    }

    loadRoute().catch(
      (routeError) => {
        if (cancelled) {
          return;
        }

        console.error(
          "RoamLab road route calculation failed:",
          routeError
        );

        setRouteStatus(
          "unavailable"
        );

        setRouteDistanceKm(
          null
        );

        setRouteDurationMin(
          null
        );
      }
    );

    return () => {
      cancelled = true;

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {
          // ignore
        }

        mapRef.current =
          null;
      }
    };
  }, [
    latitude,
    longitude,
    originLatitude,
    originLongitude,
  ]);

  const exactTripDates =
    wildSchedule?.timingMode === "exact" &&
    wildSchedule.startDate &&
    wildSchedule.endDate
      ? calendarDatesBetween(
          wildSchedule.startDate,
          wildSchedule.endDate
        )
      : [];

  const tripForecastDays =
    weather && exactTripDates.length > 0
      ? exactTripDates
          .map((date) =>
            weather.days.find(
              (day) => day.date === date
            )
          )
          .filter(
            (day): day is WeatherDay =>
              Boolean(day)
          )
      : [];

  const exactTripFullyForecastable =
    exactTripDates.length > 0 &&
    tripForecastDays.length ===
      exactTripDates.length;

  function backToBrief() {
    const back =
      new URLSearchParams();

    back.set(
      "returnMatch",
      returnMatch
    );

    router.push(
      `/wild-plan/destination?${back.toString()}`
    );
  }

  return (
    <main className="intelligencePage">
      <header className="globalHeader">
        <button
          type="button"
          className="brand"
          onClick={() =>
            router.push("/")
          }
        >
          ROAMLAB
        </button>

        <span className="headerTitle">
          DESTINATION
          INTELLIGENCE
        </span>

        <button
          type="button"
          className="backButton"
          onClick={
            backToBrief
          }
        >
          ← BACK TO
          DESTINATION BRIEF
        </button>
      </header>

      <div className="desk">
        <article className="paper">
          <section className="documentHeader">
            <div className="documentIdentity">
              <span className="kicker">
                ROAMLAB ·
                DESTINATION
                INTELLIGENCE
              </span>

              <h1>
                {name}
              </h1>

              <p>
                PRE-SELECTION
                DESTINATION
                RESEARCH ·
                DECISION SUPPORT
              </p>
            </div>

            <div className="researchStamp">
              <span>
                ROAMLAB FIELD
                DESK
              </span>

              <strong>
                RESEARCH MODE
              </strong>

              <em>
                NOT YET
                SELECTED
              </em>
            </div>
          </section>

          <section className="identityRow">
            <div>
              <span>
                SOURCE
              </span>

              <strong>
                {source.toUpperCase()}
              </strong>
            </div>

            <div>
              <span>
                REFERENCE
              </span>

              <strong>
                {sourceId}
              </strong>
            </div>

            <div>
              <span>
                LOCATION
              </span>

              <strong>
                {latitude !==
                  null &&
                longitude !==
                  null
                  ? `${latitude.toFixed(
                      3
                    )}°, ${longitude.toFixed(
                      3
                    )}°`
                  : "—"}
              </strong>
            </div>

            <div>
              <span>
                GEOGRAPHIC
                DISTANCE
              </span>

              <strong>
                {distanceKm !==
                null
                  ? `${Math.round(
                      distanceKm
                    ).toLocaleString()} KM`
                  : "—"}
              </strong>
            </div>

            <div>
              <span>
                INTERNAL MATCH
              </span>

              <strong>
                {matchScore !==
                null
                  ? Math.round(
                      matchScore
                    )
                  : "—"}
              </strong>
            </div>
          </section>

          <nav className="sectionNav">
            <button
              type="button"
              className={activeSection === "overview" ? "active" : ""}
              onClick={() => setActiveSection("overview")}
            >
              OVERVIEW
            </button>

            <button type="button">
              TOPOGRAPHY
            </button>

            <button
              type="button"
              className={activeSection === "weather" ? "active" : ""}
              onClick={() => setActiveSection("weather")}
            >
              WEATHER
            </button>

            <button type="button">
              TERRAIN & LAND
              COVER
            </button>

            <button type="button">
              ACTIVITIES
            </button>

            <button type="button">
              CAMPING &
              FACILITIES
            </button>

            <button type="button">
              ACCESS & PERMITS
            </button>

            <button type="button">
              SAFETY
            </button>

            <button type="button">
              WILD FIT
            </button>
          </nav>

          <div className="contentGrid">
            <section className="mainColumn">
              {activeSection === "overview" ? (
                <>
              <div className="sectionHeading">
                <span>
                  01 · OVERVIEW
                </span>

                <h2>
                  Destination
                  intelligence.
                </h2>
              </div>

              <p className="introCopy">
                This page is the
                research layer
                between destination
                discovery and final
                selection. Use it to
                understand how this
                place fits your Wild
                before committing it
                to the full plan.
              </p>

              <section className="routeAccessSection">
                <div className="routeAccessHeading">
                  <div>
                    <span>
                      ROUTE &
                      ACCESS
                    </span>

                    <h2>
                      How this
                      Wild begins.
                    </h2>
                  </div>

                  <div className="routeModeBadge">
                    DRIVE · ACCESS
                    FEASIBILITY
                  </div>
                </div>

                <div className="journeyStrip">
                  <div className="journeyPoint">
                    <span>
                      STARTING FROM
                    </span>

                    <strong>
                      {originLabel}
                    </strong>
                  </div>

                  <div className="journeyLine">
                    <span>
                      DRIVE
                    </span>

                    <i />
                  </div>

                  <div className="journeyPoint destinationPoint">
                    <span>
                      DESTINATION
                    </span>

                    <strong>
                      {name}
                    </strong>
                  </div>
                </div>

                <div className="routeFacts">
                  <div>
                    <span>
                      ROAD DISTANCE
                    </span>

                    <strong>
                      {routeStatus ===
                      "loading"
                        ? "CALCULATING…"
                        : routeDistanceKm !==
                            null
                          ? `${Math.round(
                              routeDistanceKm
                            ).toLocaleString()} KM`
                          : "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      EST. DRIVE TIME
                    </span>

                    <strong>
                      {routeDurationMin !==
                      null
                        ? formatDuration(
                            routeDurationMin
                          )
                        : routeStatus ===
                            "loading"
                          ? "CALCULATING…"
                          : "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      ACCESS TYPE
                    </span>

                    <strong>
                      ROAD · DRIVE
                    </strong>
                  </div>
                </div>

                <div className="liveMapWrap">
                  {originLatitude !==
                    null &&
                  originLongitude !==
                    null &&
                  latitude !==
                    null &&
                  longitude !==
                    null ? (
                    <div
                      id="destination-intelligence-map"
                      className="liveMap"
                      aria-label={`Road route from ${originLabel} to ${name}`}
                    />
                  ) : (
                    <div className="mapUnavailable">
                      STARTING POINT
                      DATA UNAVAILABLE
                    </div>
                  )}

                  {routeStatus ===
                    "loading" && (
                    <div className="routeLoading">
                      CALCULATING
                      ROAD ACCESS…
                    </div>
                  )}

                  {routeStatus ===
                    "unavailable" && (
                    <div className="routeUnavailable">
                      ROAD ROUTE
                      COULD NOT BE
                      CALCULATED
                    </div>
                  )}

                  <div className="mapCaption">
                    <span>
                      ACCESS ROUTE
                    </span>

                    <strong>
                      OPENSTREETMAP
                      · OSRM
                    </strong>
                  </div>
                </div>

                <p className="routeNote">
                  ACCESS SNAPSHOT ·
                  FASTEST ROAD ROUTE
                  ESTIMATE · FINAL
                  ACCESS, CONDITIONS
                  AND STOPS ARE
                  PLANNED AFTER
                  DESTINATION
                  SELECTION.
                </p>
              </section>
                </>
              ) : (
                <>
                  <div className="sectionHeading">
                    <span>03 · WEATHER</span>
                    <h2>Weather intelligence.</h2>
                  </div>

                  <p className="introCopy">
                    A near-term weather window for this destination. This is decision support for current conditions and the next seven days — not a substitute for a trip-date forecast when your Wild dates are farther out.
                  </p>

                  <section className="weatherSection">
                    <div className="weatherHeader">
                      <div>
                        <span>WEATHER WINDOW</span>
                        <h2>What the next seven days look like.</h2>
                      </div>
                      <div className="weatherSourceBadge">OPEN-METEO · LIVE</div>
                    </div>

                    {weatherStatus === "loading" && (
                      <div className="weatherMessage">READING DESTINATION WEATHER…</div>
                    )}

                    {weatherStatus === "unavailable" && (
                      <div className="weatherMessage">WEATHER DATA IS CURRENTLY UNAVAILABLE</div>
                    )}

                    {weatherStatus === "ready" && weather && (
                      <>
                        <div className="currentWeather">
                          <div>
                            <span>CURRENT CONDITION</span>
                            <strong>{weatherLabel(weather.currentCode)}</strong>
                          </div>
                          <div>
                            <span>TEMPERATURE</span>
                            <strong>{weather.currentTemperature !== null ? `${Math.round(weather.currentTemperature)}°C` : "—"}</strong>
                          </div>
                          <div>
                            <span>FEELS LIKE</span>
                            <strong>{weather.apparentTemperature !== null ? `${Math.round(weather.apparentTemperature)}°C` : "—"}</strong>
                          </div>
                          <div>
                            <span>WIND</span>
                            <strong>{weather.currentWindKmh !== null ? `${Math.round(weather.currentWindKmh)} KM/H` : "—"}</strong>
                          </div>
                        </div>

                        <div className="forecastList">
                          {weather.days.map((day, index) => (
                            <article className="forecastDay" key={day.date}>
                              <div className="forecastDayTitle">
                                <span>{index === 0 ? "TODAY" : shortDate(day.date)}</span>
                                <strong>{weatherLabel(day.code)}</strong>
                              </div>
                              <div className="forecastMetric">
                                <span>HIGH / LOW</span>
                                <strong>{Math.round(day.tempMax)}° / {Math.round(day.tempMin)}°C</strong>
                              </div>
                              <div className="forecastMetric">
                                <span>PRECIP.</span>
                                <strong>{day.precipitationProbability !== null ? `${Math.round(day.precipitationProbability)}%` : "—"}</strong>
                                <small>{day.precipitationMm.toFixed(1)} MM</small>
                              </div>
                              <div className="forecastMetric">
                                <span>MAX WIND</span>
                                <strong>{Math.round(day.windMaxKmh)} KM/H</strong>
                              </div>
                            </article>
                          ))}
                        </div>

                        <div className="weatherMeta">
                          <span>LOCAL TIMEZONE</span>
                          <strong>{weather.timezone}</strong>
                          <span>FORECAST HORIZON</span>
                          <strong>7 DAYS</strong>
                        </div>
                      </>
                    )}

                    <div className="tripWindowNotice">
                      <span>TRIP WEATHER WINDOW</span>

                      {wildSchedule?.timingMode === "exact" &&
                      wildSchedule.startDate &&
                      wildSchedule.endDate ? (
                        <>
                          <strong>
                            {formatTripDate(wildSchedule.startDate)}
                            {" — "}
                            {formatTripDate(wildSchedule.endDate)}
                          </strong>

                          <div className="tripWindowFacts">
                            <span>
                              {typeof wildSchedule.days === "number"
                                ? `${wildSchedule.days} DAYS`
                                : `${exactTripDates.length} DAYS`}
                            </span>

                            <span>
                              {typeof wildSchedule.nights === "number"
                                ? `${wildSchedule.nights} NIGHTS`
                                : `${Math.max(0, exactTripDates.length - 1)} NIGHTS`}
                            </span>

                            <span>EXACT DATES</span>
                          </div>

                          {weatherStatus === "ready" &&
                          weather &&
                          exactTripFullyForecastable ? (
                            <>
                              <div className="tripForecastStatus available">
                                TRIP FORECAST AVAILABLE
                              </div>

                              <div className="tripForecastList">
                                {tripForecastDays.map((day) => (
                                  <article
                                    className="tripForecastDay"
                                    key={`trip-${day.date}`}
                                  >
                                    <div>
                                      <span>{shortDate(day.date)}</span>
                                      <strong>{weatherLabel(day.code)}</strong>
                                    </div>

                                    <div>
                                      <span>HIGH / LOW</span>
                                      <strong>
                                        {Math.round(day.tempMax)}° /{" "}
                                        {Math.round(day.tempMin)}°C
                                      </strong>
                                    </div>

                                    <div>
                                      <span>PRECIP.</span>
                                      <strong>
                                        {day.precipitationProbability !== null
                                          ? `${Math.round(day.precipitationProbability)}%`
                                          : "—"}
                                      </strong>
                                      <small>
                                        {day.precipitationMm.toFixed(1)} MM
                                      </small>
                                    </div>

                                    <div>
                                      <span>MAX WIND</span>
                                      <strong>
                                        {Math.round(day.windMaxKmh)} KM/H
                                      </strong>
                                    </div>
                                  </article>
                                ))}
                              </div>

                              <p>
                                These saved Wild dates fall completely inside the current Open-Meteo forecast window, so the rows above are the real destination forecast for this trip window. Conditions can still change; recheck close to departure.
                              </p>
                            </>
                          ) : weatherStatus === "loading" ? (
                            <p>
                              Checking your saved Wild dates against the current destination forecast window…
                            </p>
                          ) : (
                            <>
                              <div className="tripForecastStatus unavailable">
                                FORECAST NOT YET AVAILABLE
                              </div>

                              <p>
                                Your Wild dates are saved, but the complete trip is outside the current seven-day weather forecast window. RoamLab will not use today&apos;s forecast as if it represented those future dates. Recheck closer to departure.
                              </p>
                            </>
                          )}
                        </>
                      ) : wildSchedule?.timingMode === "flexible" ||
                        wildSchedule?.flexibleDates ? (
                        <>
                          <strong>FLEXIBLE TRIP DATES</strong>

                          <div className="tripWindowFacts">
                            {typeof wildSchedule.days === "number" && (
                              <span>{wildSchedule.days} DAYS</span>
                            )}

                            {typeof wildSchedule.nights === "number" && (
                              <span>{wildSchedule.nights} NIGHTS</span>
                            )}

                            <span>DATES FLEXIBLE</span>
                          </div>

                          <p>
                            Your Wild duration is saved, but the calendar dates are flexible. The seven-day weather window above is current destination intelligence only and is not yet a trip-specific forecast.
                          </p>
                        </>
                      ) : (
                        <>
                          <strong>TRIP DATE NOT SET</strong>

                          <div className="tripWindowFacts">
                            {typeof wildSchedule?.days === "number" && (
                              <span>{wildSchedule.days} DAYS</span>
                            )}

                            {typeof wildSchedule?.nights === "number" && (
                              <span>{wildSchedule.nights} NIGHTS</span>
                            )}

                            <span>DATE UNDECIDED</span>
                          </div>

                          <p>
                            The seven-day weather window above shows real near-term destination conditions. Set exact Wild dates when you are ready and RoamLab will compare them with the available forecast window.
                          </p>
                        </>
                      )}
                    </div>

                    <p className="weatherNote">
                      FORECAST DATA · OPEN-METEO · CONDITIONS CAN CHANGE · RECHECK CLOSE TO DEPARTURE.
                    </p>
                  </section>
                </>
              )}
            </section>

            <aside className="sideColumn">
              <section className="sideBlock decisionBlock">
                <span className="sideLabel">
                  DECISION STATUS
                </span>

                <h3>
                  Still exploring.
                </h3>

                <p>
                  Viewing this
                  intelligence page
                  does not set the
                  destination. Return
                  to the Destination
                  Brief when you are
                  ready to compare
                  or confirm.
                </p>
              </section>

              <section className="sideBlock">
                <span className="sideLabel">
                  CURRENT
                  DESTINATION
                </span>

                <strong className="sideDestination">
                  {name}
                </strong>

                <p>
                  Candidate #
                  {String(
                    Number(
                      returnMatch
                    ) + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </p>
              </section>

              <section className="sideBlock">
                <span className="sideLabel">
                  NEXT DATA
                  LAYERS
                </span>

                <div className="dataLayerList">
                  <span>
                    TOPOGRAPHY
                  </span>

                  <span>
                    WEATHER
                  </span>

                  <span>
                    TERRAIN &
                    LAND COVER
                  </span>

                  <span>
                    CAMPING &
                    FACILITIES
                  </span>

                  <span>
                    ACCESS &
                    PERMITS
                  </span>

                  <span>
                    SAFETY
                  </span>
                </div>
              </section>

              <section className="sideBlock returnBlock">
                <span className="sideLabel">
                  RETURN PATH
                </span>

                <p>
                  Your active match
                  remains part of
                  the Destination
                  Brief comparison.
                </p>

                <button
                  type="button"
                  onClick={
                    backToBrief
                  }
                >
                  BACK TO
                  DESTINATION
                  BRIEF →
                </button>
              </section>
            </aside>
          </div>

          <footer className="documentFooter">
            <div>
              <span>
                ROAMLAB
              </span>

              <strong>
                DESTINATION
                INTELLIGENCE
              </strong>
            </div>

            <p>
              RESEARCH BEFORE
              COMMITMENT ·
              CONFIRMATION HAPPENS
              IN THE DESTINATION
              BRIEF
            </p>
          </footer>
        </article>
      </div>

      <style jsx global>{`
        * {
          box-sizing:
            border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background:
            #15130f;
        }

        body {
          overflow-x:
            hidden;
        }

        .leaflet-container {
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .roamlabIntelligenceCenter {
          width: auto !important;
          min-width: 74px;
          height: 30px;
          padding:
            0 9px;
          border:
            1px solid
            rgba(
              30,
              27,
              22,
              0.45
            );
          border-radius:
            2px;
          background:
            rgba(
              242,
              234,
              217,
              0.94
            );
          color:
            #3d3328;
          font-size:
            8px;
          font-weight:
            900;
          letter-spacing:
            0.08em;
          cursor:
            pointer;
          box-shadow:
            0 1px 5px
            rgba(
              0,
              0,
              0,
              0.2
            );
        }

        .roamlabIntelligenceCenter:hover {
          background:
            #fffaf0;
        }
      `}</style>

      <style jsx>{`
        .intelligencePage {
          min-height:
            100vh;

          background:
            radial-gradient(
              circle at
                50% 10%,
              rgba(
                115,
                83,
                50,
                0.16
              ),
              transparent
                38%
            ),
            linear-gradient(
              180deg,
              #171510
                0%,
              #0f0e0b
                100%
            );

          color:
            #2f2922;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .globalHeader {
          position:
            fixed;

          z-index:
            100;

          top: 0;
          left: 0;
          right: 0;

          height:
            58px;

          display:
            grid;

          grid-template-columns:
            1fr auto 1fr;

          align-items:
            center;

          padding:
            0 32px;

          border-bottom:
            1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );

          background:
            rgba(
              13,
              13,
              11,
              0.95
            );

          backdrop-filter:
            blur(14px);
        }

        .brand,
        .backButton {
          border: 0;
          padding: 0;

          background:
            transparent;

          color:
            #eee5d5;

          cursor:
            pointer;
        }

        .brand {
          justify-self:
            start;

          font-size:
            18px;

          font-weight:
            900;

          letter-spacing:
            0.14em;
        }

        .headerTitle {
          color:
            rgba(
              238,
              229,
              213,
              0.64
            );

          font-size:
            9px;

          font-weight:
            800;

          letter-spacing:
            0.22em;
        }

        .backButton {
          justify-self:
            end;

          color:
            #d59a62;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.1em;
        }

        .desk {
          width:
            100%;

          padding:
            104px 24px
            70px;
        }

        .paper {
          position:
            relative;

          width:
            min(
              1180px,
              calc(
                100vw -
                  48px
              )
            );

          margin:
            0 auto;

          padding:
            42px 48px
            34px;

          background:
            linear-gradient(
              135deg,
              rgba(
                255,
                255,
                255,
                0.22
              ),
              transparent
                30%
            ),
            #e8dfcd;

          box-shadow:
            0 28px 80px
              rgba(
                0,
                0,
                0,
                0.45
              ),
            inset 0 0
              90px
              rgba(
                91,
                69,
                43,
                0.08
              );
        }

        .paper::before {
          content: "";

          position:
            absolute;

          inset: 0;

          pointer-events:
            none;

          opacity:
            0.28;

          background-image:
            repeating-linear-gradient(
              0deg,
              rgba(
                  75,
                  57,
                  38,
                  0.025
                )
                0,
              rgba(
                  75,
                  57,
                  38,
                  0.025
                )
                1px,
              transparent
                1px,
              transparent
                4px
            );
        }

        .documentHeader {
          position:
            relative;

          display:
            flex;

          justify-content:
            space-between;

          align-items:
            flex-start;

          gap:
            32px;

          padding-bottom:
            28px;

          border-bottom:
            2px solid
            #393129;
        }

        .documentIdentity {
          max-width:
            780px;
        }

        .kicker {
          display:
            block;

          margin-bottom:
            12px;

          color:
            #8c542d;

          font-size:
            10px;

          font-weight:
            900;

          letter-spacing:
            0.2em;
        }

        .documentIdentity h1 {
          max-width:
            760px;

          margin: 0;

          color:
            #2d261f;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(
              34px,
              4.6vw,
              62px
            );

          font-weight:
            500;

          line-height:
            0.98;

          letter-spacing:
            -0.045em;
        }

        .documentIdentity p {
          margin:
            16px 0 0;

          color:
            #766756;

          font-size:
            10px;

          font-weight:
            800;

          letter-spacing:
            0.13em;
        }

        .researchStamp {
          position:
            relative;

          flex:
            0 0 164px;

          min-height:
            118px;

          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;

          justify-content:
            center;

          gap:
            5px;

          padding:
            15px 10px;

          border:
            3px double
            rgba(
              124,
              64,
              39,
              0.78
            );

          color:
            #7a402a;

          text-align:
            center;

          transform:
            rotate(-2deg);

          box-shadow:
            inset 0 0 0
              3px
              rgba(
                124,
                64,
                39,
                0.08
              );

          background:
            radial-gradient(
              circle at
                20% 30%,
              rgba(
                  123,
                  66,
                  41,
                  0.07
                )
                0 1px,
              transparent
                2px
            ),
            radial-gradient(
              circle at
                80% 70%,
              rgba(
                  123,
                  66,
                  41,
                  0.06
                )
                0 1px,
              transparent
                2px
            );

          background-size:
            13px 13px,
            17px 17px;
        }

        .researchStamp span {
          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.18em;
        }

        .researchStamp strong {
          font-size:
            18px;

          line-height:
            1;

          letter-spacing:
            0.08em;
        }

        .researchStamp em {
          font-style:
            normal;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.13em;
        }

        .identityRow {
          position:
            relative;

          display:
            grid;

          grid-template-columns:
            repeat(
              5,
              1fr
            );

          border-bottom:
            1px solid
            rgba(
              57,
              49,
              41,
              0.3
            );
        }

        .identityRow > div {
          min-width:
            0;

          padding:
            16px 14px
            15px 0;

          border-right:
            1px solid
            rgba(
              57,
              49,
              41,
              0.18
            );
        }

        .identityRow > div + div {
          padding-left:
            14px;
        }

        .identityRow > div:last-child {
          border-right:
            0;
        }

        .identityRow span {
          display:
            block;

          margin-bottom:
            5px;

          color:
            #8b7a67;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.12em;
        }

        .identityRow strong {
          display:
            block;

          overflow:
            hidden;

          color:
            #332a22;

          font-size:
            13px;

          font-weight:
            800;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;
        }

        .sectionNav {
          position:
            relative;

          display:
            flex;

          gap: 0;

          overflow-x:
            auto;

          margin:
            0 -48px;

          padding:
            0 48px;

          border-bottom:
            1px solid
            rgba(
              57,
              49,
              41,
              0.25
            );

          scrollbar-width:
            none;
        }

        .sectionNav::-webkit-scrollbar {
          display:
            none;
        }

        .sectionNav button {
          flex:
            0 0 auto;

          height:
            46px;

          border: 0;

          border-bottom:
            2px solid
            transparent;

          padding:
            0 14px;

          background:
            transparent;

          color:
            #82715f;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.1em;

          cursor:
            pointer;
        }

        .sectionNav button:first-child {
          padding-left:
            0;
        }

        .sectionNav button.active {
          border-bottom-color:
            #8b542e;

          color:
            #6f3f22;
        }

        .contentGrid {
          position:
            relative;

          display:
            grid;

          grid-template-columns:
            minmax(
              0,
              1fr
            )
            290px;

          gap:
            46px;

          padding-top:
            38px;
        }

        .mainColumn {
          min-width:
            0;
        }

        .sectionHeading span {
          display:
            block;

          color:
            #8b542e;

          font-size:
            10px;

          font-weight:
            900;

          letter-spacing:
            0.15em;
        }

        .sectionHeading h2 {
          margin:
            8px 0 0;

          color:
            #302820;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            32px;

          font-weight:
            500;

          letter-spacing:
            -0.025em;
        }

        .introCopy {
          max-width:
            670px;

          margin:
            14px 0 0;

          color:
            #5d5144;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            15px;

          line-height:
            1.7;
        }

        .routeAccessSection {
          margin-top:
            30px;
        }

        .routeAccessHeading {
          display:
            flex;

          align-items:
            flex-end;

          justify-content:
            space-between;

          gap:
            20px;

          margin-bottom:
            18px;
        }

        .routeAccessHeading span {
          color:
            #8b542e;

          font-size:
            10px;

          font-weight:
            900;

          letter-spacing:
            0.16em;
        }

        .routeAccessHeading h2 {
          margin:
            5px 0 0;

          color:
            #2d261f;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            24px;

          font-weight:
            500;
        }

        .routeModeBadge {
          padding:
            8px 10px;

          border:
            1px solid
            rgba(
              139,
              84,
              46,
              0.35
            );

          color:
            #75462a;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.11em;

          white-space:
            nowrap;
        }

        .journeyStrip {
          display:
            grid;

          grid-template-columns:
            minmax(
              0,
              1fr
            )
            120px
            minmax(
              0,
              1fr
            );

          gap:
            14px;

          align-items:
            center;

          padding:
            16px 0;

          border-top:
            1px solid
            rgba(
              65,
              52,
              39,
              0.22
            );

          border-bottom:
            1px solid
            rgba(
              65,
              52,
              39,
              0.22
            );
        }

        .journeyPoint span,
        .routeFacts span {
          display:
            block;

          color:
            #8b7a67;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.12em;
        }

        .journeyPoint strong {
          display:
            block;

          margin-top:
            5px;

          color:
            #332a22;

          font-size:
            13px;

          line-height:
            1.3;
        }

        .destinationPoint {
          text-align:
            right;
        }

        .journeyLine {
          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;

          gap:
            6px;

          color:
            #8b542e;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.14em;
        }

        .journeyLine i {
          position:
            relative;

          display:
            block;

          width:
            100%;

          height:
            1px;

          background:
            #8b542e;
        }

        .journeyLine i::before,
        .journeyLine i::after {
          content: "";

          position:
            absolute;

          top:
            50%;

          width:
            7px;

          height:
            7px;

          border-radius:
            50%;

          background:
            #8b542e;

          transform:
            translateY(
              -50%
            );
        }

        .journeyLine i::before {
          left: 0;
        }

        .journeyLine i::after {
          right: 0;
        }

        .routeFacts {
          display:
            grid;

          grid-template-columns:
            repeat(
              3,
              minmax(
                0,
                1fr
              )
            );

          border-bottom:
            1px solid
            rgba(
              65,
              52,
              39,
              0.22
            );
        }

        .routeFacts > div {
          padding:
            13px 14px
            13px 0;

          border-right:
            1px solid
            rgba(
              65,
              52,
              39,
              0.16
            );
        }

        .routeFacts > div + div {
          padding-left:
            14px;
        }

        .routeFacts > div:last-child {
          border-right:
            0;
        }

        .routeFacts strong {
          display:
            block;

          margin-top:
            5px;

          color:
            #332a22;

          font-size:
            14px;

          letter-spacing:
            0.02em;
        }

        .liveMapWrap {
          position:
            relative;

          height:
            360px;

          margin-top:
            18px;

          overflow:
            hidden;

          border:
            1px solid
            rgba(
              58,
              48,
              38,
              0.38
            );

          background:
            #c9c0ad;
        }

        .liveMap {
          width:
            100%;

          height:
            100%;
        }

        .mapUnavailable {
          width:
            100%;

          height:
            100%;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          background:
            linear-gradient(
              135deg,
              #c9c0ad,
              #b8ad98
            );

          color:
            rgba(
              57,
              48,
              38,
              0.72
            );

          font-size:
            10px;

          font-weight:
            900;

          letter-spacing:
            0.13em;
        }

        .routeLoading,
        .routeUnavailable {
          position:
            absolute;

          z-index:
            450;

          top:
            14px;

          right:
            14px;

          padding:
            8px 10px;

          background:
            rgba(
              36,
              31,
              25,
              0.86
            );

          color:
            #eee5d5;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.1em;

          pointer-events:
            none;
        }

        .routeUnavailable {
          background:
            rgba(
              111,
              63,
              34,
              0.9
            );
        }

        .mapCaption {
          position:
            absolute;

          z-index:
            400;

          left:
            12px;

          bottom:
            12px;

          display:
            flex;

          align-items:
            center;

          gap:
            8px;

          padding:
            7px 9px;

          background:
            rgba(
              237,
              228,
              210,
              0.92
            );

          box-shadow:
            0 3px 10px
            rgba(
              0,
              0,
              0,
              0.18
            );

          pointer-events:
            none;
        }

        .mapCaption span {
          color:
            #8b542e;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.1em;
        }

        .mapCaption strong {
          color:
            #44382d;

          font-size:
            8px;

          font-weight:
            900;

          letter-spacing:
            0.06em;
        }

        .routeNote {
          margin:
            10px 0 0;

          color:
            #82715f;

          font-size:
            9px;

          font-weight:
            800;

          line-height:
            1.5;

          letter-spacing:
            0.08em;
        }


        .weatherSection { margin-top: 30px; }
        .weatherHeader { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 18px; }
        .weatherHeader span, .tripWindowNotice > span { color: #8b542e; font-size: 10px; font-weight: 900; letter-spacing: 0.16em; }
        .weatherHeader h2 { margin: 5px 0 0; color: #2d261f; font-family: Georgia, "Times New Roman", serif; font-size: 24px; font-weight: 500; }
        .weatherSourceBadge { padding: 8px 10px; border: 1px solid rgba(139,84,46,.35); color: #75462a; font-size: 9px; font-weight: 900; letter-spacing: .11em; white-space: nowrap; }
        .weatherMessage { padding: 34px 18px; border: 1px solid rgba(65,52,39,.22); color: #6c5e4e; font-size: 10px; font-weight: 900; letter-spacing: .12em; text-align: center; }
        .currentWeather { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); border-top: 1px solid rgba(65,52,39,.22); border-bottom: 1px solid rgba(65,52,39,.22); }
        .currentWeather > div { padding: 15px 14px 15px 0; border-right: 1px solid rgba(65,52,39,.16); }
        .currentWeather > div + div { padding-left: 14px; }
        .currentWeather > div:last-child { border-right: 0; }
        .currentWeather span, .forecastMetric span, .forecastDayTitle span, .weatherMeta span { display: block; color: #8b7a67; font-size: 8px; font-weight: 900; letter-spacing: .11em; }
        .currentWeather strong { display: block; margin-top: 6px; color: #332a22; font-size: 15px; }
        .forecastList { margin-top: 18px; border-top: 1px solid rgba(65,52,39,.24); }
        .forecastDay { display: grid; grid-template-columns: 1.45fr 1fr 1fr 1fr; gap: 12px; align-items: center; min-height: 68px; padding: 10px 0; border-bottom: 1px solid rgba(65,52,39,.18); }
        .forecastDayTitle strong, .forecastMetric strong { display: block; margin-top: 5px; color: #332a22; font-size: 12px; }
        .forecastMetric small { display: block; margin-top: 3px; color: #82715f; font-size: 8px; font-weight: 800; letter-spacing: .06em; }
        .weatherMeta { display: grid; grid-template-columns: auto 1fr auto 1fr; gap: 8px 12px; align-items: center; margin-top: 14px; padding: 12px 14px; background: rgba(255,255,255,.14); }
        .weatherMeta strong { color: #44382d; font-size: 10px; }
        .tripWindowNotice { margin-top: 20px; padding: 18px; border: 1px solid rgba(109,63,35,.3); background: rgba(121,79,43,.055); }
        .tripWindowNotice > strong { display: block; margin-top: 8px; color: #312920; font-family: Georgia, "Times New Roman", serif; font-size: 19px; font-weight: 500; }
        .tripWindowNotice p { margin: 8px 0 0; color: #6c5e4e; font-size: 12px; line-height: 1.6; }
        .tripWindowFacts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .tripWindowFacts span { padding: 6px 8px; border: 1px solid rgba(109,63,35,.22); background: rgba(255,255,255,.12); color: #6c5039; font-size: 8px; font-weight: 900; letter-spacing: .1em; }
        .tripForecastStatus { margin-top: 14px; padding: 9px 10px; border-left: 3px solid #6e593f; background: rgba(255,255,255,.13); color: #4b4034; font-size: 9px; font-weight: 900; letter-spacing: .12em; }
        .tripForecastStatus.available { border-left-color: #536744; }
        .tripForecastStatus.unavailable { border-left-color: #8b542e; }
        .tripForecastList { margin-top: 12px; border-top: 1px solid rgba(65,52,39,.2); }
        .tripForecastDay { display: grid; grid-template-columns: 1.45fr 1fr 1fr 1fr; gap: 12px; align-items: center; min-height: 62px; padding: 9px 0; border-bottom: 1px solid rgba(65,52,39,.16); }
        .tripForecastDay span { display: block; color: #8b7a67; font-size: 8px; font-weight: 900; letter-spacing: .1em; }
        .tripForecastDay strong { display: block; margin-top: 4px; color: #332a22; font-size: 11px; }
        .tripForecastDay small { display: block; margin-top: 3px; color: #82715f; font-size: 8px; font-weight: 800; letter-spacing: .06em; }
        .weatherNote { margin: 10px 0 0; color: #82715f; font-size: 9px; font-weight: 800; line-height: 1.5; letter-spacing: .08em; }

        .sideColumn {
          border-left:
            1px solid
            rgba(
              57,
              49,
              41,
              0.25
            );

          padding-left:
            26px;
        }

        .sideBlock {
          padding:
            0 0 24px;

          margin-bottom:
            24px;

          border-bottom:
            1px solid
            rgba(
              57,
              49,
              41,
              0.2
            );
        }

        .sideLabel {
          display:
            block;

          margin-bottom:
            9px;

          color:
            #8b542e;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.14em;
        }

        .sideBlock h3 {
          margin:
            0 0 9px;

          color:
            #312920;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            23px;

          font-weight:
            500;
        }

        .sideBlock p {
          margin: 0;

          color:
            #6c5e4e;

          font-size:
            13px;

          line-height:
            1.55;
        }

        .decisionBlock {
          padding:
            18px;

          border:
            1px solid
            rgba(
              109,
              63,
              35,
              0.3
            );

          background:
            rgba(
              121,
              79,
              43,
              0.055
            );
        }

        .sideDestination {
          display:
            block;

          margin-bottom:
            7px;

          color:
            #312920;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            17px;

          line-height:
            1.3;
        }

        .dataLayerList {
          display:
            grid;

          gap:
            7px;
        }

        .dataLayerList span {
          padding:
            7px 8px;

          border-left:
            2px solid
            rgba(
              139,
              84,
              46,
              0.55
            );

          background:
            rgba(
              255,
              255,
              255,
              0.14
            );

          color:
            #655545;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.08em;
        }

        .returnBlock button {
          width:
            100%;

          margin-top:
            14px;

          border:
            1px solid
            #724327;

          padding:
            11px 12px;

          background:
            transparent;

          color:
            #724327;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.09em;

          cursor:
            pointer;

          transition:
            160ms ease;
        }

        .returnBlock button:hover {
          background:
            #724327;

          color:
            #f0e7d5;
        }

        .documentFooter {
          position:
            relative;

          display:
            flex;

          justify-content:
            space-between;

          align-items:
            flex-end;

          gap:
            24px;

          margin-top:
            38px;

          padding-top:
            18px;

          border-top:
            2px solid
            #393129;
        }

        .documentFooter div {
          display:
            flex;

          flex-direction:
            column;

          gap:
            3px;
        }

        .documentFooter span {
          color:
            #8b542e;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.15em;
        }

        .documentFooter strong {
          color:
            #332b23;

          font-size:
            11px;

          letter-spacing:
            0.08em;
        }

        .documentFooter p {
          max-width:
            520px;

          margin: 0;

          color:
            #81715f;

          font-size:
            8px;

          font-weight:
            900;

          line-height:
            1.5;

          text-align:
            right;

          letter-spacing:
            0.1em;
        }

        @media (
          max-width:
            900px
        ) {
          .globalHeader {
            grid-template-columns:
              1fr auto;

            padding:
              0 18px;
          }

          .headerTitle {
            display:
              none;
          }

          .desk {
            padding:
              82px 12px
              40px;
          }

          .paper {
            width:
              100%;

            padding:
              30px 24px;
          }

          .sectionNav {
            margin:
              0 -24px;

            padding:
              0 24px;
          }

          .documentHeader {
            gap:
              18px;
          }

          .researchStamp {
            flex-basis:
              138px;
          }

          .identityRow {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }

          .contentGrid {
            grid-template-columns:
              1fr;

            gap:
              34px;
          }

          .sideColumn {
            border-left:
              0;

            border-top:
              1px solid
              rgba(
                57,
                49,
                41,
                0.25
              );

            padding:
              28px 0 0;
          }
        }

        @media (
          max-width:
            640px
        ) {
          .globalHeader {
            height:
              54px;
          }

          .brand {
            font-size:
              15px;
          }

          .backButton {
            max-width:
              150px;

            font-size:
              8px;

            text-align:
              right;
          }

          .paper {
            padding:
              24px 18px;
          }

          .documentHeader {
            flex-direction:
              column;
          }

          .researchStamp {
            align-self:
              flex-end;

            width:
              150px;

            flex-basis:
              auto;
          }

          .identityRow {
            grid-template-columns:
              1fr;
          }

          .identityRow > div,
          .identityRow > div + div {
            padding:
              12px 0;

            border-right:
              0;

            border-bottom:
              1px solid
              rgba(
                57,
                49,
                41,
                0.14
              );
          }

          .sectionNav {
            margin:
              0 -18px;

            padding:
              0 18px;
          }

          .routeAccessHeading {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .journeyStrip {
            grid-template-columns:
              1fr;
          }

          .journeyLine {
            align-items:
              flex-start;
          }

          .journeyLine i {
            width:
              80px;
          }

          .destinationPoint {
            text-align:
              left;
          }

          .routeFacts {
            grid-template-columns:
              1fr;
          }

          .routeFacts > div {
            border-right:
              0;

            border-bottom:
              1px solid
              rgba(
                65,
                52,
                39,
                0.14
              );

            padding:
              12px 0;
          }

          .routeFacts > div + div {
            padding-left:
              0;
          }

          .liveMapWrap {
            height:
              320px;
          }

          .tripForecastDay {
            grid-template-columns:
              1fr 1fr;
          }

          .documentFooter {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .documentFooter p {
            text-align:
              left;
          }
        }
      `}</style>
    </main>
  );
}

function LoadingDestinationIntelligence() {
  return (
    <main
      style={{
        minHeight:
          "100vh",

        background:
          "#15130f",
      }}
    />
  );
}

export default function DestinationIntelligencePage() {
  return (
    <Suspense
      fallback={
        <LoadingDestinationIntelligence />
      }
    >
      <DestinationIntelligenceContent />
    </Suspense>
  );
}

// END OF FILE
