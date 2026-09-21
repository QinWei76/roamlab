import type {
  DestinationCandidate,
} from "@/lib/destination/types";

const RIDB_BASE_URL =
  "https://ridb.recreation.gov/api/v1";

type RidbRecAreaRaw = {
  RecAreaID?: string;
  RecAreaName?: string;
  RecAreaDescription?: string;
  RecAreaLatitude?: number;
  RecAreaLongitude?: number;
  RecAreaMapURL?: string;
  RecAreaReservationURL?: string;
  RecAreaFeeDescription?: string;
};

type RidbActivityRaw = {
  ActivityID?: string;
  ActivityName?: string;
  ActivityLevel?: number;
};

type RidbResponse<T> = {
  RECDATA?: T[];

  METADATA?: {
    RESULTS?: {
      CURRENT_COUNT?: number;
      TOTAL_COUNT?: number;
    };
  };
};

export type RidbRecArea = {
  id: string;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
  reservationUrl?: string;
  feeDescription?: string;
};

export type RidbActivity = {
  id: string;
  name: string;
  level?: number;
};

function getApiKey(): string {
  const apiKey =
    process.env.RIDB_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RIDB_API_KEY is not configured."
    );
  }

  return apiKey;
}

async function ridbFetch<T>(
  path: string
): Promise<T> {
  const response = await fetch(
    `${RIDB_BASE_URL}${path}`,
    {
      headers: {
        accept: "application/json",
        apikey: getApiKey(),
      },

      next: {
        revalidate: 3600,
      },
    }
  );

  if (!response.ok) {
    const body =
      await response.text();

    throw new Error(
      `RIDB request failed: ${response.status} ${response.statusText} ${body}`
    );
  }

  return (await response.json()) as T;
}

/**
 * RIDB descriptions and fee information
 * can contain HTML.
 *
 * Convert them into clean plain text before
 * the data reaches RoamLab.
 */
function cleanRidbText(
  value?: string
): string | undefined {
  if (!value) {
    return undefined;
  }

  const cleaned = value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<\/div>/gi, " ")
    .replace(/<\/li>/gi, " ")
    .replace(/<\/h[1-6]>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || undefined;
}

function isValidLatitude(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
}

function isValidLongitude(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
}

function normalizeRecArea(
  area: RidbRecAreaRaw
): RidbRecArea | null {
  if (
    !area.RecAreaID ||
    !area.RecAreaName
  ) {
    return null;
  }

  return {
    id: area.RecAreaID,

    name:
      area.RecAreaName.trim(),

    description:
      cleanRidbText(
        area.RecAreaDescription
      ),

    latitude:
      isValidLatitude(
        area.RecAreaLatitude
      )
        ? area.RecAreaLatitude
        : undefined,

    longitude:
      isValidLongitude(
        area.RecAreaLongitude
      )
        ? area.RecAreaLongitude
        : undefined,

    mapUrl:
      area.RecAreaMapURL ||
      undefined,

    reservationUrl:
      area.RecAreaReservationURL ||
      undefined,

    feeDescription:
      cleanRidbText(
        area.RecAreaFeeDescription
      ),
  };
}

function normalizeActivity(
  activity: RidbActivityRaw
): RidbActivity | null {
  if (
    !activity.ActivityID ||
    !activity.ActivityName
  ) {
    return null;
  }

  return {
    id: activity.ActivityID,

    name:
      activity.ActivityName.trim(),

    level:
      typeof activity.ActivityLevel ===
      "number"
        ? activity.ActivityLevel
        : undefined,
  };
}

/**
 * Convert normalized RIDB recreation area
 * data into RoamLab's provider-independent
 * destination format.
 */
export function ridbRecAreaToCandidate(
  area: RidbRecArea
): DestinationCandidate | null {
  if (
    !isValidLatitude(
      area.latitude
    ) ||
    !isValidLongitude(
      area.longitude
    )
  ) {
    return null;
  }

  return {
    source: "ridb",
    sourceId: area.id,

    name: area.name,
    description:
      area.description,

    latitude:
      area.latitude,

    longitude:
      area.longitude,

    feeDescription:
      area.feeDescription,

    reservationUrl:
      area.reservationUrl,

    mapUrl:
      area.mapUrl,
  };
}

export async function getRidbRecAreas(
  options?: {
    query?: string;
    limit?: number;
    offset?: number;
  }
): Promise<RidbRecArea[]> {
  const params =
    new URLSearchParams();

  const limit =
    Math.min(
      Math.max(
        options?.limit ?? 10,
        1
      ),
      50
    );

  params.set(
    "limit",
    String(limit)
  );

  params.set(
    "offset",
    String(
      Math.max(
        options?.offset ?? 0,
        0
      )
    )
  );

  if (
    options?.query?.trim()
  ) {
    params.set(
      "query",
      options.query.trim()
    );
  }

  const data =
    await ridbFetch<
      RidbResponse<RidbRecAreaRaw>
    >(
      `/recareas?${params.toString()}`
    );

  return (
    data.RECDATA ?? []
  )
    .map(normalizeRecArea)
    .filter(
      (
        area
      ): area is RidbRecArea =>
        area !== null
    );
}

/**
 * Retrieve the structured activities
 * associated with one RIDB Recreation Area.
 *
 * Example:
 * Hiking
 * Camping
 * Fishing
 * Wildlife Viewing
 */
export async function getRidbRecAreaActivities(
  recAreaId: string
): Promise<RidbActivity[]> {
  const data =
    await ridbFetch<
      RidbResponse<RidbActivityRaw>
    >(
      `/recareas/${encodeURIComponent(
        recAreaId
      )}/activities`
    );

  return (
    data.RECDATA ?? []
  )
    .map(normalizeActivity)
    .filter(
      (
        activity
      ): activity is RidbActivity =>
        activity !== null
    );
}

/**
 * Fetch recreation areas and convert
 * them into candidates usable by
 * RoamLab's matching engine.
 */
export async function getRidbDestinationCandidates(
  options?: {
    query?: string;
    limit?: number;
    offset?: number;
  }
): Promise<DestinationCandidate[]> {
  const areas =
    await getRidbRecAreas(
      options
    );

  return areas
    .map(
      ridbRecAreaToCandidate
    )
    .filter(
      (
        candidate
      ): candidate is DestinationCandidate =>
        candidate !== null
    );
}

export async function getRidbRecArea(
  recAreaId: string
): Promise<RidbRecArea | null> {
  const data =
    await ridbFetch<RidbRecAreaRaw>(
      `/recareas/${encodeURIComponent(
        recAreaId
      )}`
    );

  return normalizeRecArea(
    data
  );
}
