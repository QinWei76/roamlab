export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type GeoPointWithDistance = GeoPoint & {
  distanceKm: number;
};

const EARTH_RADIUS_KM = 6371.0088;

function toRadians(
  degrees: number
): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Check whether a latitude value is valid.
 */
export function isValidLatitude(
  latitude: number
): boolean {
  return (
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90
  );
}

/**
 * Check whether a longitude value is valid.
 */
export function isValidLongitude(
  longitude: number
): boolean {
  return (
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Check whether a geographic point contains
 * valid latitude / longitude coordinates.
 */
export function isValidGeoPoint(
  point: GeoPoint
): boolean {
  return (
    isValidLatitude(point.latitude) &&
    isValidLongitude(point.longitude)
  );
}

/**
 * Calculate straight-line distance between
 * two geographic coordinates.
 *
 * Uses the Haversine formula.
 *
 * Important:
 * This is geographic distance, not driving
 * distance or route distance.
 */
export function calculateDistanceKm(
  from: GeoPoint,
  to: GeoPoint
): number {
  if (!isValidGeoPoint(from)) {
    throw new Error(
      "Invalid origin coordinates."
    );
  }

  if (!isValidGeoPoint(to)) {
    throw new Error(
      "Invalid destination coordinates."
    );
  }

  const latitude1 =
    toRadians(from.latitude);

  const latitude2 =
    toRadians(to.latitude);

  const latitudeDifference =
    toRadians(
      to.latitude - from.latitude
    );

  const longitudeDifference =
    toRadians(
      to.longitude - from.longitude
    );

  const a =
    Math.sin(
      latitudeDifference / 2
    ) ** 2 +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(
        longitudeDifference / 2
      ) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return EARTH_RADIUS_KM * c;
}

/**
 * Calculate distance and round it to
 * one decimal place for RoamLab UI /
 * matching use.
 */
export function calculateRoundedDistanceKm(
  from: GeoPoint,
  to: GeoPoint
): number {
  const distance =
    calculateDistanceKm(from, to);

  return Math.round(distance * 10) / 10;
}

/**
 * Check whether a destination is inside
 * the user's maximum travel distance.
 */
export function isWithinDistanceKm(
  from: GeoPoint,
  to: GeoPoint,
  maxDistanceKm: number
): boolean {
  if (
    !Number.isFinite(maxDistanceKm) ||
    maxDistanceKm < 0
  ) {
    return false;
  }

  return (
    calculateDistanceKm(from, to) <=
    maxDistanceKm
  );
}
