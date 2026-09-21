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

function getApiKey(): string {
  const apiKey = process.env.RIDB_API_KEY;

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
    const body = await response.text();

    throw new Error(
      `RIDB request failed: ${response.status} ${response.statusText} ${body}`
    );
  }

  return (await response.json()) as T;
}

function normalizeRecArea(
  area: RidbRecAreaRaw
): RidbRecArea | null {
  if (!area.RecAreaID || !area.RecAreaName) {
    return null;
  }

  return {
    id: area.RecAreaID,
    name: area.RecAreaName,

    description:
      area.RecAreaDescription || undefined,

    latitude:
      typeof area.RecAreaLatitude === "number"
        ? area.RecAreaLatitude
        : undefined,

    longitude:
      typeof area.RecAreaLongitude === "number"
        ? area.RecAreaLongitude
        : undefined,

    mapUrl:
      area.RecAreaMapURL || undefined,

    reservationUrl:
      area.RecAreaReservationURL || undefined,

    feeDescription:
      area.RecAreaFeeDescription || undefined,
  };
}

export async function getRidbRecAreas(
  options?: {
    query?: string;
    limit?: number;
    offset?: number;
  }
): Promise<RidbRecArea[]> {
  const params = new URLSearchParams();

  const limit = Math.min(
    Math.max(options?.limit ?? 10, 1),
    50
  );

  params.set("limit", String(limit));
  params.set(
    "offset",
    String(
      Math.max(options?.offset ?? 0, 0)
    )
  );

  if (options?.query?.trim()) {
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

  return (data.RECDATA ?? [])
    .map(normalizeRecArea)
    .filter(
      (
        area
      ): area is RidbRecArea =>
        area !== null
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

  return normalizeRecArea(data);
}
