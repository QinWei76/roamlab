export type VehicleKey =
  | "suv"
  | "truck"
  | "van"
  | "crossover"
  | "city";

export type TripKey =
  | "weekend"
  | "road-trip"
  | "basecamp"
  | "remote";

export type CrewKey =
  | "solo"
  | "couple"
  | "family"
  | "friends";

export type DurationKey =
  | "overnight"
  | "weekend"
  | "multi-day"
  | "extended";

export type Priority =
  | "essential"
  | "recommended"
  | "optional";

export type GearItem = {
  name: string;
  priority: Priority;
};

export type GearSystem = {
  personal: GearItem[];
  vehicle: GearItem[];
  safety: GearItem[];
};

export type GearProfile = {
  vehicle: VehicleKey;
  trip: TripKey;
  crew: CrewKey;
  people: number;
  duration: DurationKey;
};

export function generateGearSystem(
  profile: GearProfile
): GearSystem {
  const {
    vehicle,
    trip,
    people,
    duration,
  } = profile;

  const isRemote = trip === "remote";
  const isLong =
    duration === "multi-day" ||
    duration === "extended";
  const isLargeCrew = people >= 4;
  const isCityCar = vehicle === "city";

  const personal: GearItem[] = [
    {
      name: "Sleeping System",
      priority: "essential",
    },
    {
      name: "Clothing Layers",
      priority: "essential",
    },
    {
      name: "Personal Lighting",
      priority: isRemote
        ? "essential"
        : "recommended",
    },
    {
      name: "Water & Hydration",
      priority: "essential",
    },
    {
      name: "Hygiene Kit",
      priority: isLong
        ? "essential"
        : "recommended",
    },
    {
      name: "Personal Essentials",
      priority: "essential",
    },
  ];

  const vehicleGear: GearItem[] = [
    {
      name: "Vehicle Sleeping Setup",
      priority: "essential",
    },
    {
      name: "Power",
      priority:
        isRemote || isLong
          ? "essential"
          : "recommended",
    },
    {
      name: "Cooking",
      priority:
        duration === "overnight"
          ? "recommended"
          : "essential",
    },
    {
      name: "Food Storage",
      priority:
        isLong || isLargeCrew
          ? "essential"
          : "recommended",
    },
    {
      name: "Water Storage",
      priority:
        isRemote ||
        isLong ||
        isLargeCrew
          ? "essential"
          : "recommended",
    },
    {
      name: "Camp Lighting",
      priority: "recommended",
    },
    {
      name: "Storage & Organization",
      priority: isCityCar
        ? "essential"
        : "recommended",
    },
    {
      name: "Shelter",
      priority:
        trip === "basecamp"
          ? "essential"
          : "recommended",
    },
    {
      name: "Camp Furniture",
      priority:
        trip === "basecamp"
          ? "recommended"
          : "optional",
    },
  ];

  const safety: GearItem[] = [
    {
      name: "First Aid",
      priority: "essential",
    },
    {
      name: "Fire Safety",
      priority: "essential",
    },
    {
      name: "Tire & Repair",
      priority: "essential",
    },
    {
      name: "Vehicle Recovery",
      priority: isRemote
        ? "essential"
        : "recommended",
    },
    {
      name: "Jump Start / Backup Power",
      priority: "recommended",
    },
    {
      name: "Navigation",
      priority: isRemote
        ? "essential"
        : "recommended",
    },
    {
      name: "Emergency Communication",
      priority: isRemote
        ? "essential"
        : "optional",
    },
    {
      name: "Emergency Water & Food",
      priority:
        isRemote || isLong
          ? "essential"
          : "recommended",
    },
  ];

  return {
    personal,
    vehicle: vehicleGear,
    safety,
  };
}
