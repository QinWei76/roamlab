"use client";


import {
  useEffect,
  useState
} from "react";


import Link from "next/link";


import TerrainLayer from "@/components/intelligence/TerrainLayer";





type IntelligenceSection =
  | "overview"
  | "weather"
  | "terrain";





type WeatherSnapshot = {

  temperature:number | null;

  precipitation:number | null;

  windSpeed:number | null;

  forecastDate:string;

};






type LandscapeItem = {

  code:number;

  name:string;

  samples:number;

  percentage:number;

};





type TerrainSnapshot = {

  landscapeProfile:
    LandscapeItem[];


  terrainSummary:{

    dominantCover:string;

    waterInfluence:string;

  };


  wildContext:{

    landscapeCharacter:string;

    dominantEnvironment:string;

    vegetationCharacter:string;

    terrainCharacter:string;

    waterInfluence:string;


    planningConsiderations:
      string[];

  };

};







type Destination = {

  id:string;

  name:string;

  latitude:number;

  longitude:number;

  description?:string;

};








export default function IntelligencePage(){



  const [
    activeSection,
    setActiveSection
  ] =
  useState<IntelligenceSection>(
    "overview"
  );




  const [
    destination,
    setDestination
  ] =
  useState<Destination | null>(
    null
  );





  const [
    weather,
    setWeather
  ] =
  useState<WeatherSnapshot | null>(
    null
  );





  const [
    terrain,
    setTerrain
  ] =
  useState<TerrainSnapshot | null>(
    null
  );





  const [
    loadingTerrain,
    setLoadingTerrain
  ] =
  useState(false);






  /*
    Load current destination

    Keep your existing wildStore
    logic here.
  */



  useEffect(()=>{


    const saved =
      localStorage.getItem(
        "currentDestination"
      );


    if(!saved){

      return;

    }


    try{


      const parsed =
        JSON.parse(
          saved
        );


      setDestination(
        parsed
      );


    }
    catch(error){


      console.error(
        "Destination load failed",
        error
      );


    }



  },[]);









  /*
    Terrain Intelligence

    Uses:
    /api/terrain-intelligence

  */



useEffect(() => {

  if (!destination) {
    return;
  }

  const latitude = destination.latitude;
  const longitude = destination.longitude;

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    return;
  }

  async function loadTerrain() {

    try {

      setLoadingTerrain(true);

      const response = await fetch(
        `/api/terrain-intelligence` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}`
      );

      const data = await response.json();

      if (
        data.status === "available"
      ) {
        setTerrain(data);
      }

    } catch (error) {

      console.error(
        "Terrain loading failed",
        error
      );

    } finally {

      setLoadingTerrain(false);

    }

  }

  loadTerrain();

}, [destination]);
        
  /*
    Weather loading stays here.

    Keep your existing Open Meteo
    code in this block.
  */



  useEffect(()=>{


    if(
      !destination
    ){

      return;

    }



    // existing weather logic

  },[
    destination
  ]);
  return (

    <main className="intel-page">


      {/* HEADER */}

      <header className="intel-header">


        <Link
          href="/wild-plan"
          className="intel-back"
        >
          ← WILD PLAN
        </Link>



        <div className="intel-title">


          <span>
            DESTINATION INTELLIGENCE
          </span>


          <h1>
            Understand Your Wild
          </h1>


        </div>


      </header>








      {/* DESTINATION */}

      {
        destination && (

          <section className="intel-destination">


            <h2>
              {destination.name}
            </h2>


            {
              destination.description && (

                <p>
                  {destination.description}
                </p>

              )
            }


          </section>

        )
      }










      {/* NAVIGATION */}

      <nav className="intel-tabs">


        <button

          className={
            activeSection === "overview"
              ? "active"
              : ""
          }

          onClick={()=>(
            setActiveSection(
              "overview"
            )
          )}

        >

          OVERVIEW

        </button>





        <button

          className={
            activeSection === "weather"
              ? "active"
              : ""
          }


          onClick={()=>(
            setActiveSection(
              "weather"
            )
          )}

        >

          WEATHER

        </button>





        <button


          className={
            activeSection === "terrain"
              ? "active"
              : ""
          }


          onClick={()=>(
            setActiveSection(
              "terrain"
            )
          )}

        >

          TERRAIN & LAND COVER


        </button>



      </nav>









      {/* CONTENT */}


      <section className="intel-content">





      {
        activeSection === "overview"

        &&

        (

          <div className="intel-paper">


            <h3>
              DESTINATION OVERVIEW
            </h3>



            <p>

              Explore the landscape,
              access conditions,
              weather patterns and
              planning intelligence
              before your Wild.

            </p>



          </div>

        )

      }









      {
        activeSection === "weather"

        &&

        (

          <div className="intel-paper">


            <h3>
              WEATHER INTELLIGENCE
            </h3>



            {
              weather ? (

                <div>


                  <p>
                    Temperature:
                    {" "}
                    {weather.temperature}
                    °C
                  </p>



                  <p>
                    Wind:
                    {" "}
                    {weather.windSpeed}
                    km/h
                  </p>



                  <p>
                    Forecast:
                    {" "}
                    {weather.forecastDate}
                  </p>


                </div>

              )

              :

              (

                <p>
                  Loading weather intelligence...
                </p>

              )

            }


          </div>

        )

      }









      {
        activeSection === "terrain"

        &&

        (

          loadingTerrain

          ?

          (

            <div className="intel-paper">


              <h3>
                TERRAIN & LAND COVER
              </h3>


              <p>
                Reading landscape data...
              </p>


            </div>

          )


          :


          terrain

          ?

          (

            <TerrainLayer

              landscapeProfile={
                terrain.landscapeProfile
              }


              terrainSummary={
                terrain.terrainSummary
              }


              wildContext={
                terrain.wildContext
              }

            />

          )


          :

          (

            <div className="intel-paper">


              <h3>
                TERRAIN & LAND COVER
              </h3>


              <p>
                Terrain data unavailable.
              </p>


            </div>

          )


        )

      }





      </section>






    </main>

  );


}
<style jsx>{`

.intel-page {

  min-height:100vh;

  padding:40px;

  background:
    #e7dcc8;

  color:#2b241c;

}





.intel-header {

  display:flex;

  justify-content:space-between;

  align-items:flex-start;

  margin-bottom:40px;

}





.intel-back {

  text-decoration:none;

  font-size:12px;

  letter-spacing:2px;

  color:#5c4b38;

}





.intel-title span {

  font-size:11px;

  letter-spacing:3px;

  opacity:.7;

}





.intel-title h1 {

  margin-top:10px;

  font-size:38px;

  font-weight:500;

  letter-spacing:-1px;

}





.intel-destination {

  background:
    rgba(255,255,255,.35);

  border:

    1px solid
    rgba(80,60,40,.15);

  padding:28px;

  margin-bottom:30px;

}





.intel-destination h2 {

  margin:0 0 10px;

  font-size:30px;

}





.intel-destination p {

  max-width:700px;

  line-height:1.7;

  opacity:.75;

}







.intel-tabs {

  display:flex;

  gap:20px;

  border-bottom:

    1px solid
    rgba(80,60,40,.2);

  margin-bottom:35px;

}





.intel-tabs button {

  background:none;

  border:none;

  padding:

    12px 0;

  cursor:pointer;

  font-size:12px;

  letter-spacing:2px;

  color:#6b5944;

}





.intel-tabs button.active {

  border-bottom:

    2px solid
    #2b241c;

  color:#2b241c;

}





.intel-content {

  max-width:1000px;

}





.intel-paper {

  background:

    rgba(255,255,255,.45);

  border:

    1px solid
    rgba(70,50,30,.15);

  padding:40px;

}





.intel-paper h3 {

  margin-top:0;

  font-size:13px;

  letter-spacing:3px;

}





.intel-paper p {

  line-height:1.8;

  color:#594a39;

}






/* Terrain Layer */

.terrain-layer {

  background:

    rgba(255,255,255,.45);

  border:

    1px solid
    rgba(70,50,30,.15);

  padding:40px;

}





.terrain-section-title {

  font-size:12px;

  letter-spacing:3px;

  color:#76634d;

}





.terrain-layer h2 {

  font-size:32px;

  font-weight:500;

  margin:

    15px 0;

}





.terrain-intro {

  max-width:650px;

  line-height:1.7;

  color:#62503c;

}





.terrain-grid {

  display:grid;

  grid-template-columns:

    2fr 1fr;

  gap:30px;

  margin-top:35px;

}





.terrain-block {

  border-top:

    1px solid
    rgba(70,50,30,.18);

  padding-top:25px;

  margin-bottom:35px;

}





.terrain-label {

  font-size:11px;

  letter-spacing:3px;

  color:#806c53;

  margin-bottom:15px;

}





.terrain-character {

  font-size:30px;

  letter-spacing:1px;

}





.terrain-profile-row {

  display:flex;

  justify-content:space-between;

  padding:

    12px 0;

  border-bottom:

    1px solid
    rgba(70,50,30,.1);

}





.terrain-profile-row strong {

  font-weight:500;

}





.terrain-condition {

  display:flex;

  flex-direction:column;

  gap:18px;

}





.terrain-condition div {

  display:flex;

  flex-direction:column;

}





.terrain-condition span {

  font-size:10px;

  letter-spacing:2px;

  color:#806c53;

}





.terrain-condition strong {

  margin-top:6px;

  font-size:18px;

  font-weight:500;

}





.terrain-side {

  background:

    rgba(220,205,180,.35);

  padding:25px;

  height:max-content;

}





.terrain-side-title {

  font-size:11px;

  letter-spacing:3px;

  margin-bottom:20px;

}





.terrain-side ul {

  padding-left:18px;

}





.terrain-side li {

  margin-bottom:14px;

  line-height:1.6;

  color:#594a39;

}





@media(max-width:800px){


  .intel-page {

    padding:20px;

  }



  .terrain-grid {

    grid-template-columns:1fr;

  }



  .intel-header {

    flex-direction:column;

    gap:20px;

  }


}


`}</style>




