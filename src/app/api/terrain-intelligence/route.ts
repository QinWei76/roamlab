import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NLCD_WMS_URL =
  "https://dmsdata.cr.usgs.gov/geoserver/mrlc_Land-Cover-Native_conus_year_data/wms";

const NLCD_LAYER =
  "mrlc_Land-Cover-Native_conus_year_data:Land-Cover-Native_conus_year_data";

const DATA_YEAR = 2025;

const NLCD_CLASSES: Record<number, string> = {
  11: "Open Water",
  12: "Perennial Ice / Snow",

  21: "Developed, Open Space",
  22: "Developed, Low Intensity",
  23: "Developed, Medium Intensity",
  24: "Developed, High Intensity",

  31: "Barren Land",

  41: "Deciduous Forest",
  42: "Evergreen Forest",
  43: "Mixed Forest",

  52: "Shrub / Scrub",

  71: "Grassland / Herbaceous",

  81: "Pasture / Hay",
  82: "Cultivated Crops",

  90: "Woody Wetlands",
  95: "Emergent Herbaceous Wetlands",
};

function isValidLatitude(value: number) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

function parseFeatureInfoValue(text: string): number | null {
  /*
    GeoServer may return text/plain in forms such as:

    Results for FeatureType ...
    Land-Cover-Native_conus_year_data = 42

    or properties such as:
    GRAY_INDEX = 42

    We deliberately try several patterns rather than depending on
    one exact GeoServer response format.
  */

  const patterns = [
    /GRAY_INDEX\s*=\s*["']?(\d+)/i,
    /Land-Cover[^=\n]*=\s*["']?(\d+)/i,
    /Land_Cover[^=\n]*=\s*["']?(\d+)/i,
    /\bvalue\s*=\s*["']?(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      const value = Number(match[1]);

      if (Number.isFinite(value)) {
        return value;
      }
    }
  }

  /*
    Final fallback:
    search for a known NLCD class code appearing as a standalone value.
  */

  const knownCodes = Object.keys(NLCD_CLASSES)
    .map(Number)
    .sort((a, b) => b - a);

  for (const code of knownCodes) {
    const pattern = new RegExp(`\\b${code}\\b`);

    if (pattern.test(text)) {
      return code;
    }
  }

  return null;
}

function buildFeatureInfoUrl(latitude: number, longitude: number) {
  /*
    We query a tiny geographic box around the destination.

    0.001 degrees is roughly 100 m north/south.
    The request image is intentionally small because we only need
    the center pixel corresponding to the destination.
  */

  const delta = 0.001;

  const minLon = longitude - delta;
  const minLat = latitude - delta;
  const maxLon = longitude + delta;
  const maxLat = latitude + delta;

  const params = new URLSearchParams({
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetFeatureInfo",

    LAYERS: NLCD_LAYER,
    QUERY_LAYERS: NLCD_LAYER,

    SRS: "EPSG:4326",
    BBOX: `${minLon},${minLat},${maxLon},${maxLat}`,

    WIDTH: "3",
    HEIGHT: "3",

    X: "1",
    Y: "1",

    INFO_FORMAT: "text/plain",
    FORMAT: "image/png",

    FEATURE_COUNT: "1",

    TIME: `${DATA_YEAR}-01-01T00:00:00.000Z`,
  });

  return `${NLCD_WMS_URL}?${params.toString()}`;
}

async function queryLandCover(latitude: number, longitude: number) {
  const url = buildFeatureInfoUrl(latitude, longitude);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "text/plain",
    },
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `USGS NLCD request failed (${response.status}): ${text.slice(0, 500)}`
    );
  }

  const code = parseFeatureInfoValue(text);

  if (code === null) {
    return {
      available: false,
      code: null,
      name: null,
      rawResponse: text.slice(0, 1000),
    };
  }

  return {
    available: true,
    code,
    name: NLCD_CLASSES[code] ?? `NLCD Class ${code}`,
    rawResponse: text.slice(0, 1000),
  };
}

function buildUnavailableResponse(
  latitude: number,
  longitude: number,
  reason: string
) {
  return {
    status: "unavailable",

    coordinate: {
      latitude,
      longitude,
    },

    landCover: {
      code: null,
      name: null,
    },

    dataYear: DATA_YEAR,

    dataset: "Annual NLCD",

    source: "USGS / MRLC",

    reason,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const latitudeRaw = searchParams.get("latitude");
    const longitudeRaw = searchParams.get("longitude");

    if (!latitudeRaw || !longitudeRaw) {
      return NextResponse.json(
        {
          error: "Missing latitude or longitude.",
          example:
            "/api/terrain-intelligence?latitude=41.924&longitude=-70.043",
        },
        {
          status: 400,
        }
      );
    }

    const latitude = Number(latitudeRaw);
    const longitude = Number(longitudeRaw);

    if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
      return NextResponse.json(
        {
          error: "Invalid latitude or longitude.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await queryLandCover(latitude, longitude);

    if (!result.available) {
      return NextResponse.json(
        buildUnavailableResponse(
          latitude,
          longitude,
          "No Annual NLCD land-cover value was returned for this coordinate."
        )
      );
    }

    return NextResponse.json({
      status: "available",

      coordinate: {
        latitude,
        longitude,
      },

      landCover: {
        code: result.code,
        name: result.name,
      },

      dataYear: DATA_YEAR,

      dataset: "Annual NLCD",

      source: "USGS / MRLC",

      resolutionMeters: 30,

      interpretation: {
        scope: "destination-point",
        note:
          "This value represents the NLCD raster cell at the destination coordinate. It does not yet describe the wider destination landscape.",
      },
    });
  } catch (error) {
    console.error("Terrain intelligence error:", error);

    return NextResponse.json(
      {
        status: "error",
        error: "Unable to retrieve terrain intelligence.",
        detail:
          error instanceof Error
            ? error.message
            : "Unknown terrain intelligence error.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const latitude = Number(body?.latitude);
    const longitude = Number(body?.longitude);

    if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
      return NextResponse.json(
        {
          error: "Valid latitude and longitude are required.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await queryLandCover(latitude, longitude);

    if (!result.available) {
      return NextResponse.json(
        buildUnavailableResponse(
          latitude,
          longitude,
          "No Annual NLCD land-cover value was returned for this coordinate."
        )
      );
    }

    return NextResponse.json({
      status: "available",

      coordinate: {
        latitude,
        longitude,
      },

      landCover: {
        code: result.code,
        name: result.name,
      },

      dataYear: DATA_YEAR,

      dataset: "Annual NLCD",

      source: "USGS / MRLC",

      resolutionMeters: 30,

      interpretation: {
        scope: "destination-point",
        note:
          "This value represents the NLCD raster cell at the destination coordinate. It does not yet describe the wider destination landscape.",
      },
    });
  } catch (error) {
    console.error("Terrain intelligence error:", error);

    return NextResponse.json(
      {
        status: "error",
        error: "Unable to retrieve terrain intelligence.",
        detail:
          error instanceof Error
            ? error.message
            : "Unknown terrain intelligence error.",
      },
      {
        status: 500,
      }
    );
  }
}
