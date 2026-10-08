function JourneyMap({
  origin,
  destination,
  originName,
  destinationName,
  savedDistanceKm,
  savedHours,
  onEdit,
}: {
  origin?: Point;
  destination?: Point;
  originName: string;
  destinationName: string;
  savedDistanceKm?: number;
  savedHours?: number;
  onEdit: () => void;
}) {
  const [routePoints, setRoutePoints] = useState<Point[]>([]);
  const [liveDistance, setLiveDistance] = useState<number | undefined>(
    undefined
  );
  const [liveHours, setLiveHours] = useState<number | undefined>(
    undefined
  );

  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");

  const ready = isPoint(origin) && isPoint(destination);

  useEffect(() => {
    let cancelled = false;

    if (!isPoint(origin) || !isPoint(destination)) {
      setRoutePoints([]);
      setLiveDistance(undefined);
      setLiveHours(undefined);
      setStatus("idle");

      return () => {
        cancelled = true;
      };
    }

    const start: Point = origin;
    const end: Point = destination;

    async function loadRoute() {
      setStatus("loading");

      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${start.longitude},${start.latitude};` +
          `${end.longitude},${end.latitude}` +
          `?overview=full&geometries=geojson&steps=false&alternatives=false`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("OSRM route failed");
        }

        const data = await response.json();
        const first = data?.routes?.[0];

        if (!first?.geometry?.coordinates?.length) {
          throw new Error("No route geometry");
        }

        const points: Point[] = first.geometry.coordinates
          .map((p: unknown) => {
            if (
              !Array.isArray(p) ||
              p.length < 2 ||
              typeof p[0] !== "number" ||
              typeof p[1] !== "number" ||
              !Number.isFinite(p[0]) ||
              !Number.isFinite(p[1])
            ) {
              return null;
            }

            return {
              longitude: p[0],
              latitude: p[1],
            };
          })
          .filter((p: Point | null): p is Point => p !== null);

        if (points.length < 2) {
          throw new Error("Route geometry is invalid");
        }

        if (cancelled) return;

        setRoutePoints(points);

        setLiveDistance(
          typeof first.distance === "number" &&
            Number.isFinite(first.distance)
            ? first.distance / 1000
            : undefined
        );

        setLiveHours(
          typeof first.duration === "number" &&
            Number.isFinite(first.duration)
            ? first.duration / 3600
            : undefined
        );

        setStatus("ready");
      } catch (error) {
        console.error("Journey route failed:", error);

        if (!cancelled) {
          setRoutePoints([]);
          setLiveDistance(undefined);
          setLiveHours(undefined);
          setStatus("error");
        }
      }
    }

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [
    origin?.latitude,
    origin?.longitude,
    destination?.latitude,
    destination?.longitude,
  ]);

  const distance = liveDistance ?? savedDistanceKm;
  const hours = liveHours ?? savedHours;

  const routeText = [
    typeof distance === "number" && Number.isFinite(distance)
      ? `${Math.round(distance)} KM`
      : "",
    typeof hours === "number" && Number.isFinite(hours)
      ? `${hours.toFixed(1)} HRS`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  /*
   * IMPORTANT:
   *
   * We only draw the route when OSRM has returned real geometry.
   *
   * We do NOT create a fake straight line between the origin and
   * destination while the route is loading or when OSRM fails.
   */
  const points =
    ready && routePoints.length > 1
      ? routePoints
      : [];

  const lats = points.map((p) => p.latitude);
  const lons = points.map((p) => p.longitude);

  const minLat =
    lats.length > 0
      ? Math.min(...lats)
      : 0;

  const maxLat =
    lats.length > 0
      ? Math.max(...lats)
      : 1;

  const minLon =
    lons.length > 0
      ? Math.min(...lons)
      : 0;

  const maxLon =
    lons.length > 0
      ? Math.max(...lons)
      : 1;

  const latSpan = Math.max(
    maxLat - minLat,
    0.0001
  );

  const lonSpan = Math.max(
    maxLon - minLon,
    0.0001
  );

  const W = 1000;
  const H = 620;

  const PX = 105;
  const PY = 88;

  const IW = W - PX * 2;
  const IH = H - PY * 2;

  function project(p: Point) {
    return {
      x:
        PX +
        ((p.longitude - minLon) / lonSpan) *
          IW,

      y:
        PY +
        ((maxLat - p.latitude) / latSpan) *
          IH,
    };
  }

  const projected = points.map(project);

  const pathD = projected
    .map((p, index) => {
      const command =
        index === 0
          ? "M"
          : "L";

      return `${command} ${p.x.toFixed(
        1
      )} ${p.y.toFixed(1)}`;
    })
    .join(" ");

  /*
   * Start/end markers are taken from the actual first and last
   * OSRM geometry points. This keeps them attached to the real
   * route instead of independently projecting a different point.
   */
  const startProjected =
    projected.length > 1
      ? projected[0]
      : undefined;

  const endProjected =
    projected.length > 1
      ? projected[projected.length - 1]
      : undefined;

  return (
    <article className="journey">
      <div className="route-paper">
        {ready &&
          routePoints.length > 1 &&
          pathD && (
            <svg
              className="journey-svg"
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <path
                d={pathD}
                fill="none"
                stroke="#e6d5b7"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity=".34"
              />

              <path
                d={pathD}
                fill="none"
                stroke="#7f382c"
                strokeWidth="3.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity=".82"
              />

              {startProjected && (
                <>
                  <circle
                    cx={startProjected.x}
                    cy={startProjected.y}
                    r="10"
                    fill="#e7d7b5"
                  />

                  <circle
                    cx={startProjected.x}
                    cy={startProjected.y}
                    r="5.5"
                    fill="#93432f"
                  />
                </>
              )}

              {endProjected && (
                <>
                  <circle
                    cx={endProjected.x}
                    cy={endProjected.y}
                    r="11"
                    fill="#e7d7b5"
                  />

                  <circle
                    cx={endProjected.x}
                    cy={endProjected.y}
                    r="6"
                    fill="#7f2f24"
                  />
                </>
              )}
            </svg>
          )}

        <button
          type="button"
          className="journey-hit"
          onClick={onEdit}
          aria-label={`Edit journey from ${originName} to ${destinationName}`}
        />

        <div className="route-distance">
          {!ready
            ? "SET START + DESTINATION"
            : status === "loading"
              ? "DRAWING ROUTE..."
              : status === "error"
                ? "ROUTE UNAVAILABLE"
                : routeText ||
                  "JOURNEY ROUTE"}
        </div>
      </div>
    </article>
  );
}
