"use client";

type LandscapeItem = {
  code:number;
  name:string;
  samples:number;
  percentage:number;
};


type WildContext = {

  landscapeCharacter:string;

  dominantEnvironment:string;

  vegetationCharacter:string;

  terrainCharacter:string;

  waterInfluence:string;

  planningConsiderations:string[];

};



type TerrainLayerProps = {

  landscapeProfile:LandscapeItem[];

  terrainSummary:{
    dominantCover:string;
    waterInfluence:string;
  };

  wildContext:WildContext;

};



export default function TerrainLayer({

  landscapeProfile,

  terrainSummary,

  wildContext

}:TerrainLayerProps){


  return (

    <section className="terrain-layer">


      <div className="terrain-section-title">

        04 · TERRAIN & LAND COVER

      </div>



      <h2>

        Terrain intelligence.

      </h2>



      <p className="terrain-intro">

        Understanding the landscape around your Wild.
        Land cover patterns help reveal terrain character,
        vegetation conditions, and planning considerations.

      </p>





      <div className="terrain-grid">



        <div className="terrain-main">



          <div className="terrain-block">


            <div className="terrain-label">

              LANDSCAPE CHARACTER

            </div>


            <div className="terrain-character">

              {wildContext.landscapeCharacter}

            </div>


            <p>

              {wildContext.dominantEnvironment}

            </p>


          </div>







          <div className="terrain-block">


            <div className="terrain-label">

              LANDSCAPE PROFILE

            </div>



            <div className="terrain-profile">


              {
                landscapeProfile
                .slice(0,5)
                .map(
                  item=>(


                    <div
                      key={item.code}
                      className="terrain-profile-row"
                    >


                      <span>

                        {item.name}

                      </span>


                      <strong>

                        {item.percentage}%

                      </strong>


                    </div>


                  )
                )
              }


            </div>


          </div>






          <div className="terrain-block">


            <div className="terrain-label">

              TERRAIN CONDITIONS

            </div>



            <div className="terrain-condition">


              <div>

                <span>
                  DOMINANT COVER
                </span>

                <strong>
                  {terrainSummary.dominantCover}
                </strong>

              </div>



              <div>

                <span>
                  WATER INFLUENCE
                </span>

                <strong>
                  {terrainSummary.waterInfluence}
                </strong>

              </div>



              <div>

                <span>
                  TERRAIN
                </span>

                <strong>
                  {wildContext.terrainCharacter}
                </strong>

              </div>


            </div>


          </div>




        </div>








        <aside className="terrain-side">


          <div className="terrain-side-title">

            WILD NOTES

          </div>



          <ul>

            {
              wildContext
              .planningConsiderations
              .map(
                note=>(

                  <li key={note}>

                    {note}

                  </li>

                )
              )
            }

          </ul>


        </aside>



      </div>



    </section>

  );

}
