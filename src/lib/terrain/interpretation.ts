export type LandscapeItem = {
  code: number;
  name: string;
  percentage: number;
};


export type WildContext = {
  landscapeCharacter: string;
  dominantEnvironment: string;
  vegetationCharacter: string;
  terrainCharacter: string;
  waterInfluence: "High" | "Moderate" | "Low";
  planningConsiderations: string[];
};



function percentageOf(
  profile: LandscapeItem[],
  keywords: string[]
) {
  return profile
    .filter(item =>
      keywords.some(keyword =>
        item.name
          .toLowerCase()
          .includes(
            keyword.toLowerCase()
          )
      )
    )
    .reduce(
      (sum,item)=>
        sum + item.percentage,
      0
    );
}



export function buildWildContext(
  profile: LandscapeItem[]
): WildContext {


  const water =
    percentageOf(
      profile,
      [
        "water",
        "wetland"
      ]
    );


  const forest =
    percentageOf(
      profile,
      [
        "forest"
      ]
    );


  const shrub =
    percentageOf(
      profile,
      [
        "shrub"
      ]
    );


  const openLand =
    percentageOf(
      profile,
      [
        "grass",
        "pasture",
        "crop"
      ]
    );



  let landscapeCharacter =
    "Mixed Landscape";


  let dominantEnvironment =
    "Balanced Terrain";



  if(
    water >= 40
  ){

    landscapeCharacter =
      "Coastal Lowland";

    dominantEnvironment =
      "Water Dominated Landscape";

  }
  else if(
    forest >= 45
  ){

    landscapeCharacter =
      "Forest Landscape";

    dominantEnvironment =
      "Wooded Terrain";

  }
  else if(
    openLand >= 45
  ){

    landscapeCharacter =
      "Open Landscape";

    dominantEnvironment =
      "Grassland / Open Terrain";

  }
  else if(
    shrub >= 35
  ){

    landscapeCharacter =
      "Shrubland Edge";

    dominantEnvironment =
      "Mixed Vegetation";

  }



  let vegetationCharacter =
    "Mixed Vegetation";


  if(
    forest >= 40
  ){

    vegetationCharacter =
      "Forest Dominated";

  }
  else if(
    shrub >= 30
  ){

    vegetationCharacter =
      "Coastal / Shrub Vegetation";

  }



  let terrainCharacter =
    "Variable Terrain";


  if(
    water >= 40
  ){

    terrainCharacter =
      "Flat Low Elevation Terrain";

  }



  let waterInfluence:
    WildContext["waterInfluence"] =
      "Low";


  if(
    water >= 40
  ){

    waterInfluence =
      "High";

  }
  else if(
    water >= 20
  ){

    waterInfluence =
      "Moderate";

  }




  const planningConsiderations:string[]=[];



  if(
    waterInfluence === "High"
  ){

    planningConsiderations.push(
      "Water-resistant storage is recommended"
    );


    planningConsiderations.push(
      "Wind and moisture may influence camp setup"
    );

  }



  if(
    forest >= 35
  ){

    planningConsiderations.push(
      "Tree cover may limit solar exposure"
    );

  }



  if(
    shrub >= 30
  ){

    planningConsiderations.push(
      "Open vegetation areas may have limited shade"
    );

  }



  if(
    planningConsiderations.length===0
  ){

    planningConsiderations.push(
      "Review local conditions before final setup"
    );

  }



  return {

    landscapeCharacter,

    dominantEnvironment,

    vegetationCharacter,

    terrainCharacter,

    waterInfluence,

    planningConsiderations

  };

}
