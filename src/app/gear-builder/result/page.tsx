"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";


const systems = [

  {
    title: "Sleeping System",
    image: "/sleeping.jpg",
    description:
      "Create a comfortable sleeping setup inside your vehicle.",
    items:[
      "Sleeping platform",
      "Comfort mattress",
      "Compact bedding"
    ]
  },


  {
    title: "Power System",
    image: "/power.jpg",
    description:
      "Keep your devices powered wherever you travel.",
    items:[
      "Portable power station",
      "Solar charging",
      "Power accessories"
    ]
  },


  {
    title: "Cooking System",
    image: "/cooking.jpg",
    description:
      "Build a simple outdoor kitchen.",
    items:[
      "Camp stove",
      "Cooking box",
      "Cooler setup"
    ]
  },


  {
    title: "Storage System",
    image: "/storage.jpg",
    description:
      "Organize your vehicle for faster adventures.",
    items:[
      "Storage boxes",
      "Cargo organization",
      "Modular setup"
    ]
  },


  {
    title: "Lighting System",
    image: "/lighting.jpg",
    description:
      "Light up your campsite after sunset.",
    items:[
      "Camp lantern",
      "Rechargeable lights",
      "Headlamp"
    ]
  }

];





function ResultContent(){


  const searchParams = useSearchParams();



  const vehicle =
    searchParams.get("vehicle") || "SUV";


  const style =
    searchParams.get("style") || "weekend";


  const budget =
    searchParams.get("budget") || "explorer";





  return (

    <main className="resultPage">



      {/* HERO */}

      <section className="resultHero">


        <div className="resultHeroContent">


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




          <div className="budgetBox">


            <span>
              Estimated Setup
            </span>



            <strong>
              $2,800
            </strong>


          </div>



        </div>


      </section>







      {/* SYSTEM CARDS */}


      <section className="systemSection">


        <div className="systemGrid">


        {systems.map((system)=>(


          <div

            key={system.title}

            className="systemCard"


          >



            <div className="systemImage">


              <Image

                src={system.image}

                alt={system.title}

                width={900}

                height={600}

                className="systemImg"

              />


            </div>







            <div className="systemContent">



              <h2>

                {system.title}

              </h2>



              <p>

                {system.description}

              </p>





              <ul>


              {system.items.map((item)=>(


                <li key={item}>

                  ✓ {item}

                </li>


              ))}


              </ul>






              <button>

                View Gear →

              </button>




            </div>




          </div>


        ))}



        </div>


      </section>







      {/* SAVE */}



      <section className="saveSection">


        <h2>

          Save your camping system

        </h2>


        <p>

          Get your personalized gear list and future upgrades.

        </p>





        <div className="emailBox">


          <input

            placeholder="Your email address"

          />



          <button>

            Save My Setup

          </button>



        </div>



      </section>





    </main>


  );

}





export default function ResultPage(){


  return (

    <Suspense

      fallback={

        <main>

          Loading...

        </main>

      }


    >

      <ResultContent />

    </Suspense>

  );


}
