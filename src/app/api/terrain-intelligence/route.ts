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

  21: "Developed Open Space",
  22: "Developed Low Intensity",
  23: "Developed Medium Intensity",
  24: "Developed High Intensity",

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



function validLatitude(value:number){

  return (
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  );

}


function validLongitude(value:number){

  return (
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  );

}



/*
  Convert km distance into approximate degrees.

  Good enough for regional sampling.
*/

function kmToDegree(value:number){

  return value / 111;

}



/*
  Build WMS GetFeatureInfo URL
*/


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


  const text =
    await response.text();



  if(
    !response.ok
  ){

    return null;

  }



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
      NLCD_CLASSES[code] ??
      `Class ${code}`

  };

}







function createSamplingGrid(
  latitude:number,
  longitude:number,
  radiusKm:number
){

  const radiusDegree =
    kmToDegree(
      radiusKm
    );


  const points:any[] = [];


  const steps = 5;


  for(
    let y=0;
    y<steps;
    y++
  ){

    for(
      let x=0;
      x<steps;
      x++
    ){

      const offsetX =
        (
          x -
          (steps-1)/2
        )
        *
        (
          radiusDegree*2 /
          (steps-1)
        );


      const offsetY =
        (
          y -
          (steps-1)/2
        )
        *
        (
          radiusDegree*2 /
          (steps-1)
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







function calculateSummary(
  results:{
    code:number;
    name:string;
  }[]
){

  const counter =
    new Map<
      string,
      {
        code:number;
        name:string;
        count:number;
      }
    >();



  for(
    const item of results
  ){

    const existing =
      counter.get(
        item.name
      );


    if(existing){

      existing.count +=1;

    }else{

      counter.set(
        item.name,
        {
          code:item.code,
          name:item.name,
          count:1
        }
      );

    }

  }




  const total =
    results.length;



  return Array
    .from(counter.values())
    .map(item=>({

      code:item.code,

      name:item.name,

      samples:item.count,

      percentage:
        Math.round(
          item.count /
          total *
          100
        )

    }))
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
    profile.find(
      item =>
        item.name.includes(
          "Water"
        )
        ||
        item.name.includes(
          "Wetland"
        )
    );


  return {

    dominantCover:
      dominant?.name ??
      null,


    waterInfluence:
      water &&
      water.percentage >=20
        ? "High"
        :
      water
        ? "Moderate"
        :
        "Low"

  };

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
            "Invalid coordinate"
        },
        {
          status:400
        }
      );

    }





    const points =
      createSamplingGrid(
        latitude,
        longitude,
        radiusKm
      );



    const results:any[] = [];



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





    if(
      results.length === 0
    ){

      return NextResponse.json({

        status:
          "unavailable",

        coordinate:{
          latitude,
          longitude
        },

        reason:
          "No NLCD samples returned"

      });

    }






    const landscapeProfile =
      calculateSummary(
        results
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



      terrainSummary:
        buildTerrainSummary(
          landscapeProfile
        ),



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
          "Landscape profile is calculated from sampled NLCD cells around the destination coordinate. It represents the surrounding area, not only the exact center point."

      }

    });



  }
  catch(error){


    console.error(
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
