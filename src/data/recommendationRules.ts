import { AdventureProfile } from "@/types/adventure";


export interface SystemRecommendation {

  personal: string[];

  camp: string[];

  safety: string[];

}


export function generateSystem(
  profile: AdventureProfile
): SystemRecommendation {


  const result: SystemRecommendation = {

    personal: [],

    camp: [],

    safety: [],

  };


  /*
   Personal Gear
  */

  if (
    profile.crew === "family" ||
    profile.duration === "4-7-nights"
  ) {

    result.personal.push(
      "Comfort Sleeping System"
    );

  } else {

    result.personal.push(
      "Essential Sleeping System"
    );

  }


  result.personal.push(
    "Personal Lighting",
    "Water & Hydration"
  );



  /*
    Vehicle & Camp Gear
  */


  // Power

  if (
    profile.tripStyle === "off-grid" ||
    profile.duration === "8-plus"
  ) {

    result.camp.push(
      "Large Power System"
    );

  }

  else if (
    profile.vehicle === "suv" &&
    (
      profile.crew === "family" ||
      profile.duration === "2-3-nights"
    )
  ) {

    result.camp.push(
      "Mid-size Power System"
    );

  }

  else {

    result.camp.push(
      "Compact Power System"
    );

  }



  // Cooking

  if(profile.crew === "family"){

    result.camp.push(
      "Family Cooking System"
    );

  }

  else {

    result.camp.push(
      "Portable Cooking System"
    );

  }



  // Storage

  result.camp.push(
    "Modular Storage System"
  );


  /*
    Safety
  */


  if(
    profile.tripStyle === "off-grid" ||
    profile.duration === "8-plus"
  ){

    result.safety.push(
      "Advanced Emergency System",
      "Navigation & Communication"
    );

  }

  else {

    result.safety.push(
      "Standard Safety Kit"
    );

  }


  return result;

}
