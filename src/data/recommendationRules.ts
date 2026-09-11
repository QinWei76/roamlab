import { AdventureProfile } from "@/types/adventure";


export interface SystemRecommendation {

  personal: string[];

  camp: string[];

  safety: string[];

}



export function generateSystem(
  profile: AdventureProfile
): SystemRecommendation {


  const personal: string[] = [];

  const camp: string[] = [];

  const safety: string[] = [];



  /*
   PERSONAL SYSTEM
  */


  if (
    profile.crew === "family" ||
    profile.crew === "friends" ||
    profile.duration === "4-7-nights" ||
    profile.duration === "8-plus"
  ) {

    personal.push(
      "Comfort Sleeping System"
    );

  } else {

    personal.push(
      "Essential Sleeping System"
    );

  }


  personal.push(
    "Personal Lighting",
    "Water & Hydration"
  );



  /*
   CAMP SYSTEM
  */


  // Power

  if (
    profile.tripStyle === "off-grid" ||
    profile.duration === "8-plus"
  ) {

    camp.push(
      "Large Power System"
    );


  } else if (

    profile.vehicle === "suv" &&
    (
      profile.crew === "family" ||
      profile.crew === "friends" ||
      profile.duration === "2-3-nights" ||
      profile.duration === "4-7-nights"
    )

  ) {

    camp.push(
      "Mid-size Power System"
    );


  } else {

    camp.push(
      "Compact Power System"
    );

  }



  // Cooking

  if (

    profile.crew === "family" ||
    profile.crew === "friends"

  ) {

    camp.push(
      "Group Cooking System"
    );

  } else {

    camp.push(
      "Portable Cooking System"
    );

  }



  // Storage

  if (

    profile.people >= 4 ||
    profile.duration === "4-7-nights" ||
    profile.duration === "8-plus"

  ) {

    camp.push(
      "Modular Storage System"
    );

  } else {

    camp.push(
      "Basic Storage System"
    );

  }



  /*
    SAFETY SYSTEM
  */


  if (

    profile.tripStyle === "off-grid" ||
    profile.duration === "8-plus"

  ) {


    safety.push(

      "Advanced Emergency System",

      "Navigation & Communication"

    );


  } else {


    safety.push(

      "Standard Safety System",

      "Vehicle Recovery Kit"

    );


  }



  return {

    personal,

    camp,

    safety

  };


}
