import {
  VehicleKey,
  TripKey,
  CrewKey,
  DurationKey,
} from "@/types/adventure";


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



export interface GearProfile {

  vehicle: VehicleKey;

  trip: TripKey;

  crew: CrewKey;

  people: number;

  duration: DurationKey;

}



export function generateGearSystem(
  profile: GearProfile
): GearSystem {


  const {

    trip,

    crew,

    people,

    duration,

    vehicle,

  } = profile;



  const isRemote =
    trip === "remote";


  const isLong =
    duration === "multi-day" ||
    duration === "extended";


  const isLargeCrew =
    people >= 4;


  const isCityCar =
    vehicle === "city";



  /*
  =========================
  PERSONAL SYSTEM
  =========================
  */


  const personal: GearItem[] = [

    {
      name:
        crew === "family" ||
        crew === "friends" ||
        isLong

        ? "Comfort Sleeping System"

        : "Essential Sleeping System",

      priority:
        "essential",
    },


    {
      name:
        "Clothing Layers",

      priority:
        "essential",
    },


    {
      name:
        "Personal Lighting",

      priority:
        isRemote
        ? "essential"
        : "recommended",
    },


    {
      name:
        "Water & Hydration",

      priority:
        "essential",
    },


    {
      name:
        "Hygiene Kit",

      priority:
        isLong
        ? "essential"
        : "recommended",
    },


    {
      name:
        "Personal Essentials",

      priority:
        "recommended",
    },

  ];




  /*
  =========================
  VEHICLE & CAMP SYSTEM
  =========================
  */


  const vehicleGear: GearItem[] = [


    {
      name:
        "Vehicle Sleeping Setup",

      priority:
        "essential",
    },


    {
      name:

        isRemote ||
        isLong

        ? "Large Power System"

        : (
            crew === "family" ||
            crew === "friends"
          )

          ? "Mid-size Power System"

          : "Compact Power System",


      priority:
        isRemote ||
        isLong

        ? "essential"

        : "recommended",

    },


    {
      name:

        crew === "family" ||
        crew === "friends"

        ? "Group Cooking System"

        : "Portable Cooking System",


      priority:
        duration === "overnight"

        ? "recommended"

        : "essential",

    },


    {
      name:
        "Food Storage",

      priority:
        isLargeCrew ||
        isLong

        ? "essential"

        : "recommended",

    },


    {
      name:
        "Water Storage",

      priority:
        isRemote ||
        isLong ||
        isLargeCrew

        ? "essential"

        : "recommended",

    },


    {
      name:
        "Camp Lighting",

      priority:
        "recommended",

    },


    {
      name:
        "Storage & Organization",

      priority:
        isCityCar

        ? "essential"

        : "recommended",

    },


    {
      name:
        "Shelter",

      priority:
        trip === "basecamp"

        ? "essential"

        : "recommended",

    },


    {
      name:
        "Camp Furniture",

      priority:
        trip === "basecamp"

        ? "recommended"

        : "optional",

    },

  ];





  /*
  =========================
  SAFETY SYSTEM
  =========================
  */


  const safety: GearItem[] = [


    {
      name:
        "First Aid",

      priority:
        "essential",
    },


    {
      name:
        "Fire Safety",

      priority:
        "essential",
    },


    {
      name:
        "Tire & Repair",

      priority:
        "essential",
    },


    {
      name:
        "Vehicle Recovery",

      priority:
        isRemote

        ? "essential"

        : "recommended",

    },


    {
      name:
        "Jump Start / Backup Power",

      priority:
        "recommended",

    },


    {
      name:
        "Navigation",

      priority:
        isRemote

        ? "essential"

        : "recommended",

    },


    {
      name:
        "Emergency Communication",

      priority:
        isRemote

        ? "essential"

        : "optional",

    },


    {
      name:
        "Emergency Water & Food",

      priority:
        isRemote ||
        isLong

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
