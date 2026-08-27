"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";


function ResultContent(){

  const searchParams = useSearchParams();


  const vehicle =
    searchParams.get("vehicle") || "SUV";


  const style =
    searchParams.get("style") || "weekend";


  const budget =
    searchParams.get("budget") || "explorer";



  const systems = [

    {
      title:"Sleeping System",
      items:[
        "Comfortable sleeping platform",
        "Compact sleeping gear",
      ]
    },


    {
      title:"Power System",
      items:[
        "Portable power station",
        "Solar charging option",
      ]
    },


    {
      title:"Cooking System",
      items:[
        "Compact camp kitchen",
        "Outdoor cooking essentials",
      ]
    },


    {
      title:"Storage System",
      items:[
        "Modular storage boxes",
        "Easy access organization",
      ]
    },


    {
      title:"Lighting System",
      items:[
        "Rechargeable camp lights",
        "Night campsite setup",
      ]
    },

  ];



  return (

    <main className="setupPage">



      <section className="setupHero">


        <div className="setupStep">
          YOUR CAMPING SYSTEM
        </div>



        <p className="setupVehicle">

          {vehicle.toUpperCase()}
          {" · "}
          {style.toUpperCase()}
          {" · "}
          {budget.toUpperCase()}

        </p>




        <h1>

          Your adventure
          <br/>
          starts here.

        </h1>




        <p>

          A personalized camping system built around
          your vehicle, travel style and budget.

        </p>


      </section>






      <section className="styleSection">


        <div className="styleGrid">


          {systems.map((system)=>(


            <div

              key={system.title}

              className="styleCard"

            >


              <div className="styleCardContent">


                <h2>

                  {system.title}

                </h2>


                {system.items.map((item)=>(


                  <p key={item}>

                    ✓ {item}

                  </p>


                ))}



              </div>


            </div>


          ))}



        </div>


      </section>







      <section className="ctaSection">


        <div className="ctaContent">


          <h2>

            Ready to build
            your setup?

          </h2>



          <p>

            Explore recommended gear and create
            your complete camping system.

          </p>



          <Link

            href="/gear-builder"

            className="primaryButton"

          >

            Start Again →

          </Link>


        </div>


      </section>




    </main>

  );

}




export default function ResultPage(){


  return (

    <Suspense

      fallback={

        <main className="setupPage">

          Loading...

        </main>

      }

    >

      <ResultContent/>

    </Suspense>

  );

}
