import { NextRequest, NextResponse } from "next/server";

import {
  buildWildContext,
} from "@/lib/terrain/interpretation";


export const dynamic = "force-dynamic";


const NLCD_WMS_URL =
  "https://dmsdata.cr.usgs.gov/geoserver/mrlc_Land-Cover-Native_conus_year_data/wms";


const NLCD_LAYER =
  "mrlc_Land-Cover-Native_conus_year_data:Land-Cover-Native_conus_year_data";


const DATA_YEAR = 2025;



const NLCD_CLASSES: Record<number,string> = {

  11:"Open Water",

  12:"Perennial Ice / Snow",


  21:"Developed Open Space",

  22:"Developed Low Intensity",

  23:"Developed Medium Intensity",

  24:"Developed High Intensity",


  31:"Barren Land",


  41:"Deciduous Forest",

  42:"Evergreen Forest",

  43:"Mixed Forest",


  52:"Shrub / Scrub",


  71:"Grassland / Herbaceous",


  81:"Pasture / Hay",

  82:"Cultivated Crops",


  90:"Woody Wetlands",

  95:"Emergent Herbaceous Wetlands",

};





function validLatitude(
  value:number
){

  return (
    Number.isFinite(value)
    &&
    value >= -90
    &&
    value <= 90
  );

}



function validLongitude(
  value:number
){

  return (
    Number.isFinite(value)
    &&
    value >= -180
    &&
    value <=180
  );

}





function kmToDegree(
  km:number
){

  return km / 111;

}







function buildFeatureInfoUrl(
  latitude:number,
  longitude:number
){

  const delta = 0.001;


  const params =
    new URLSearchParams({

      SERVICE:"WMS",

      VERSION:"1.1.1",

      REQUEST:"GetFeatureInfo",


      LAYERS:NLCD_LAYER,

      QUERY_LAYERS:NLCD_LAYER,


      SRS:"EPSG:4326",


      BBOX:
        `${longitude-delta},${latitude-delta},${longitude+delta},${latitude+delta}`,


      WIDTH:"3",

      HEIGHT:"3",


      X:"1",

      Y:"1",


      INFO_FORMAT:"text/plain",


      FEATURE_COUNT:"1",


      TIME:
        `${DATA_YEAR}-01-01T00:00:00.000Z`

    });


  return (
    `${NLCD_WMS_URL}?${params.toString()}`
  );

}








function parseNLCDCode(
  text:string
){

  const codes =
    Object.keys(
      NLCD_CLASSES
    )
    .map(Number)
    .sort(
      (a,b)=>b-a
    );



  for(
    const code of codes
  ){

    const regex =
      new RegExp(
        `\\b${code}\\b`
      );


    if(
      regex.test(text)
    ){

      return code;

    }

  }



  return null;

}







async function queryPoint(
  latitude:number,
  longitude:number
){

  const url =
    buildFeatureInfoUrl(
      latitude,
      longitude
    );


  const response =
    await fetch(
      url,
      {
        cache:"no-store"
      }
    );



  if(
    !response.ok
  ){

    return null;

  }



  const text =
    await response.text();



  const code =
    parseNLCDCode(
      text
    );



  if(
    code === null
  ){

    return null;

  }



  return {

    code,

    name:
      NLCD_CLASSES[code]
      ??
      `Class ${code}`

  };

}









function createSamplingGrid(
  latitude:number,
  longitude:number,
  radiusKm:number
){

  const radius =
    kmToDegree(
      radiusKm
    );



  const points:any[]=[];


  const gridSize = 5;



  for(
    let y=0;
    y<gridSize;
    y++
  ){

    for(
      let x=0;
      x<gridSize;
      x++
    ){


      const offsetX =
        (
          x -
          (gridSize-1)/2
        )
        *
        (
          radius*2 /
          (gridSize-1)
        );



      const offsetY =
        (
          y -
          (gridSize-1)/2
        )
        *
        (
          radius*2 /
          (gridSize-1)
        );



      points.push({

        latitude:
          latitude + offsetY,


        longitude:
          longitude + offsetX

      });


    }

  }


  return points;

}









function calculateLandscapeProfile(
  results:{
    code:number;
    name:string;
  }[]
){

  const map =
    new Map<
      string,
      {
        code:number;
        name:string;
        samples:number;
      }
    >();



  results.forEach(
    item=>{

      const existing =
        map.get(
          item.name
        );


      if(existing){

        existing.samples +=1;

      }
      else{

        map.set(
          item.name,
          {
            code:item.code,
            name:item.name,
            samples:1
          }
        );

      }


    }
  );



  const total =
    results.length;



  return Array
    .from(
      map.values()
    )
    .map(
      item=>({

        code:item.code,

        name:item.name,

        samples:item.samples,

        percentage:
          Math.round(
            item.samples /
            total *
            100
          )

      })
    )
    .sort(
      (a,b)=>
        b.percentage-a.percentage
    );

}







function buildTerrainSummary(
  profile:any[]
){

  const dominant =
    profile[0];


  const water =
    profile
    .filter(
      item =>
        item.name
        .toLowerCase()
        .includes("water")
        ||
        item.name
        .toLowerCase()
        .includes("wetland")
    )
    .reduce(
      (
        sum:number,
        item:any
      )=>
        sum + item.percentage,
      0
    );



  return {

    dominantCover:
      dominant?.name
      ??
      null,


    waterInfluence:

      water >=40
      ?
      "High"

      :

      water >=20
      ?
      "Moderate"

      :
      "Low"

  };

}









async function runTerrainAnalysis(
  latitude:number,
  longitude:number,
  radiusKm:number
){

  const points =
    createSamplingGrid(
      latitude,
      longitude,
      radiusKm
    );



  const results:any[]=[];



  for(
    const point of points
  ){

    const result =
      await queryPoint(
        point.latitude,
        point.longitude
      );



    if(result){

      results.push(
        result
      );

    }

  }



  return results;

}









export async function GET(
  request:NextRequest
){

  try{


    const {
      searchParams
    } =
      new URL(
        request.url
      );



    const latitude =
      Number(
        searchParams.get(
          "latitude"
        )
      );



    const longitude =
      Number(
        searchParams.get(
          "longitude"
        )
      );



    const radiusKm =
      Number(
        searchParams.get(
          "radiusKm"
        )
      )
      ||
      5;





    if(
      !validLatitude(latitude)
      ||
      !validLongitude(longitude)
    ){

      return NextResponse.json(
        {
          error:
          "Invalid coordinates"
        },
        {
          status:400
        }
      );

    }





    const results =
      await runTerrainAnalysis(
        latitude,
        longitude,
        radiusKm
      );





    if(
      results.length===0
    ){

      return NextResponse.json({

        status:
        "unavailable"

      });

    }





    const landscapeProfile =
      calculateLandscapeProfile(
        results
      );



    const terrainSummary =
      buildTerrainSummary(
        landscapeProfile
      );



    const wildContext =
      buildWildContext(
        landscapeProfile
      );





    return NextResponse.json({

      status:
      "available",



      coordinate:{

        latitude,

        longitude

      },



      area:{

        radiusKm,

        sampleCount:
        results.length

      },



      landscapeProfile,



      terrainSummary,



      wildContext,



      source:{

        dataset:
        "Annual NLCD",

        year:
        DATA_YEAR,

        provider:
        "USGS / MRLC"

      },


      interpretation:{

        scope:
        "area-sample",


        note:
        "Landscape profile is calculated from sampled NLCD cells around the destination coordinate."

      }

    });


  }
  catch(error){


    console.error(
      "Terrain API error",
      error
    );


    return NextResponse.json(

      {

        status:"error",

        message:
        "Terrain intelligence failed"

      },

      {
        status:500
      }

    );

  }

}
