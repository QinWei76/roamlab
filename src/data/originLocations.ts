export type OriginLocation = {
  id: string;
  name: string;
  region: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

/*
  RoamLab Origin Locations — V1

  These coordinates are representative city-center
  coordinates used for trip discovery and approximate
  geographic distance calculations.

  They are NOT intended for turn-by-turn navigation,
  routing, or precise GPS use.
*/

export const originLocations: OriginLocation[] = [
  {
    id: "seattle-wa",
    name: "Seattle",
    region: "Washington",
    country: "United States",
    coordinates: {
      latitude: 47.6062,
      longitude: -122.3321,
    },
  },
  {
    id: "spokane-wa",
    name: "Spokane",
    region: "Washington",
    country: "United States",
    coordinates: {
      latitude: 47.6588,
      longitude: -117.426,
    },
  },
  {
    id: "portland-or",
    name: "Portland",
    region: "Oregon",
    country: "United States",
    coordinates: {
      latitude: 45.5152,
      longitude: -122.6784,
    },
  },
  {
    id: "bend-or",
    name: "Bend",
    region: "Oregon",
    country: "United States",
    coordinates: {
      latitude: 44.0582,
      longitude: -121.3153,
    },
  },
  {
    id: "san-francisco-ca",
    name: "San Francisco",
    region: "California",
    country: "United States",
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
  },
  {
    id: "sacramento-ca",
    name: "Sacramento",
    region: "California",
    country: "United States",
    coordinates: {
      latitude: 38.5816,
      longitude: -121.4944,
    },
  },
  {
    id: "los-angeles-ca",
    name: "Los Angeles",
    region: "California",
    country: "United States",
    coordinates: {
      latitude: 34.0522,
      longitude: -118.2437,
    },
  },
  {
    id: "san-diego-ca",
    name: "San Diego",
    region: "California",
    country: "United States",
    coordinates: {
      latitude: 32.7157,
      longitude: -117.1611,
    },
  },
  {
    id: "las-vegas-nv",
    name: "Las Vegas",
    region: "Nevada",
    country: "United States",
    coordinates: {
      latitude: 36.1699,
      longitude: -115.1398,
    },
  },
  {
    id: "reno-nv",
    name: "Reno",
    region: "Nevada",
    country: "United States",
    coordinates: {
      latitude: 39.5296,
      longitude: -119.8138,
    },
  },
  {
    id: "boise-id",
    name: "Boise",
    region: "Idaho",
    country: "United States",
    coordinates: {
      latitude: 43.615,
      longitude: -116.2023,
    },
  },
  {
    id: "salt-lake-city-ut",
    name: "Salt Lake City",
    region: "Utah",
    country: "United States",
    coordinates: {
      latitude: 40.7608,
      longitude: -111.891,
    },
  },
  {
    id: "phoenix-az",
    name: "Phoenix",
    region: "Arizona",
    country: "United States",
    coordinates: {
      latitude: 33.4484,
      longitude: -112.074,
    },
  },
  {
    id: "tucson-az",
    name: "Tucson",
    region: "Arizona",
    country: "United States",
    coordinates: {
      latitude: 32.2226,
      longitude: -110.9747,
    },
  },
  {
    id: "denver-co",
    name: "Denver",
    region: "Colorado",
    country: "United States",
    coordinates: {
      latitude: 39.7392,
      longitude: -104.9903,
    },
  },
  {
    id: "colorado-springs-co",
    name: "Colorado Springs",
    region: "Colorado",
    country: "United States",
    coordinates: {
      latitude: 38.8339,
      longitude: -104.8214,
    },
  },
  {
    id: "albuquerque-nm",
    name: "Albuquerque",
    region: "New Mexico",
    country: "United States",
    coordinates: {
      latitude: 35.0844,
      longitude: -106.6504,
    },
  },
  {
    id: "billings-mt",
    name: "Billings",
    region: "Montana",
    country: "United States",
    coordinates: {
      latitude: 45.7833,
      longitude: -108.5007,
    },
  },
  {
    id: "missoula-mt",
    name: "Missoula",
    region: "Montana",
    country: "United States",
    coordinates: {
      latitude: 46.8721,
      longitude: -113.994,
    },
  },
  {
    id: "jackson-wy",
    name: "Jackson",
    region: "Wyoming",
    country: "United States",
    coordinates: {
      latitude: 43.4799,
      longitude: -110.7624,
    },
  },
  {
    id: "dallas-tx",
    name: "Dallas",
    region: "Texas",
    country: "United States",
    coordinates: {
      latitude: 32.7767,
      longitude: -96.797,
    },
  },
  {
    id: "austin-tx",
    name: "Austin",
    region: "Texas",
    country: "United States",
    coordinates: {
      latitude: 30.2672,
      longitude: -97.7431,
    },
  },
  {
    id: "houston-tx",
    name: "Houston",
    region: "Texas",
    country: "United States",
    coordinates: {
      latitude: 29.7604,
      longitude: -95.3698,
    },
  },
  {
    id: "san-antonio-tx",
    name: "San Antonio",
    region: "Texas",
    country: "United States",
    coordinates: {
      latitude: 29.4241,
      longitude: -98.4936,
    },
  },
  {
    id: "minneapolis-mn",
    name: "Minneapolis",
    region: "Minnesota",
    country: "United States",
    coordinates: {
      latitude: 44.9778,
      longitude: -93.265,
    },
  },
  {
    id: "chicago-il",
    name: "Chicago",
    region: "Illinois",
    country: "United States",
    coordinates: {
      latitude: 41.8781,
      longitude: -87.6298,
    },
  },
  {
    id: "st-louis-mo",
    name: "St. Louis",
    region: "Missouri",
    country: "United States",
    coordinates: {
      latitude: 38.627,
      longitude: -90.1994,
    },
  },
  {
    id: "nashville-tn",
    name: "Nashville",
    region: "Tennessee",
    country: "United States",
    coordinates: {
      latitude: 36.1627,
      longitude: -86.7816,
    },
  },
  {
    id: "atlanta-ga",
    name: "Atlanta",
    region: "Georgia",
    country: "United States",
    coordinates: {
      latitude: 33.749,
      longitude: -84.388,
    },
  },
  {
    id: "charlotte-nc",
    name: "Charlotte",
    region: "North Carolina",
    country: "United States",
    coordinates: {
      latitude: 35.2271,
      longitude: -80.8431,
    },
  },
  {
    id: "asheville-nc",
    name: "Asheville",
    region: "North Carolina",
    country: "United States",
    coordinates: {
      latitude: 35.5951,
      longitude: -82.5515,
    },
  },
  {
    id: "washington-dc",
    name: "Washington",
    region: "District of Columbia",
    country: "United States",
    coordinates: {
      latitude: 38.9072,
      longitude: -77.0369,
    },
  },
  {
    id: "philadelphia-pa",
    name: "Philadelphia",
    region: "Pennsylvania",
    country: "United States",
    coordinates: {
      latitude: 39.9526,
      longitude: -75.1652,
    },
  },
  {
    id: "new-york-ny",
    name: "New York",
    region: "New York",
    country: "United States",
    coordinates: {
      latitude: 40.7128,
      longitude: -74.006,
    },
  },
  {
    id: "boston-ma",
    name: "Boston",
    region: "Massachusetts",
    country: "United States",
    coordinates: {
      latitude: 42.3601,
      longitude: -71.0589,
    },
  },
  {
    id: "portland-me",
    name: "Portland",
    region: "Maine",
    country: "United States",
    coordinates: {
      latitude: 43.6591,
      longitude: -70.2568,
    },
  },
  {
    id: "orlando-fl",
    name: "Orlando",
    region: "Florida",
    country: "United States",
    coordinates: {
      latitude: 28.5383,
      longitude: -81.3792,
    },
  },
  {
    id: "tampa-fl",
    name: "Tampa",
    region: "Florida",
    country: "United States",
    coordinates: {
      latitude: 27.9506,
      longitude: -82.4572,
    },
  },
  {
    id: "miami-fl",
    name: "Miami",
    region: "Florida",
    country: "United States",
    coordinates: {
      latitude: 25.7617,
      longitude: -80.1918,
    },
  },
  {
    id: "anchorage-ak",
    name: "Anchorage",
    region: "Alaska",
    country: "United States",
    coordinates: {
      latitude: 61.2181,
      longitude: -149.9003,
    },
  },
];

/**
 * Find an origin location by its stable RoamLab ID.
 */
export function getOriginLocationById(
  id: string
): OriginLocation | undefined {
  return originLocations.find(
    (location) => location.id === id
  );
}

/**
 * Human-readable label for UI.
 *
 * Example:
 * Denver, Colorado
 */
export function getOriginLocationLabel(
  location: OriginLocation
): string {
  return `${location.name}, ${location.region}`;
}
