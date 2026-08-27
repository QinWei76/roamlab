"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";


const styles = [
  {
    id: "weekend",
    number: "01",
    title: "Weekend Escape",
    description:
      "Simple, flexible and easy to set up. Perfect for short weekend adventures.",
    image: "/weekend-escape.jpg",
  },
  {
    id: "off-grid",
    number: "02",
    title: "Off-Grid Camping",
    description:
      "Go further with a more independent setup built for remote adventures.",
    image: "/off-grid-camping.jpg",
  },
  {
    id: "road-trip",
    number: "03",
    title: "Road Trip",
    description:
      "Designed for long-distance travel with comfort and smart storage.",
    image: "/road-trip.jpg",
  },
  {
    id: "basecamp",
    number: "04",
    title: "Basecamp Setup",
    description:
      "A complete outdoor system for longer stays and bigger adventures.",
    image: "/basecamp-setup.jpg",
  },
];


function SetupContent() {

  const searchParams = useSearchParams();

  const vehicle =
    searchParams.get("vehicle") || "SUV";


  return (

    <main className="setupPage">


      {/* TOP BAR */}

      <div className="setupTopbar">

        <Link
          href="/gear-builder"
          className="backButton"
        >
          ← Back
        </Link>


        <div className="setupProgress">

          <span className="active">
            01 Vehicle
          </span>

          <span className="progressLine" />

          <span className="active">
            02 Style
          </span>

          <span className="progressLine" />

          <span>
            03 Budget
          </span>

        </div>

      </div>



      {/* HERO */}

      <section className="setupHero">

        <div className="setupStep">
          STEP 02
        </div>


        <p className="setupVehicle">
          YOUR VEHICLE · {vehicle.toUpperCase()}
        </p>


        <h1>
          How do you
          <br />
          want to camp?
        </h1>


        <p>
          Choose your camping style and we will
          build the right gear system for your journey.
        </p>


      </section>




      {/* STYLE CARDS */}

      <section className="styleSection">


        <div className="styleGrid">


          {styles.map((style) => (

            <Link

              key={style.id}

              href={`/gear-builder/budget?vehicle=${vehicle}&style=${style.id}`}

              className="styleCard"

            >


              <div className="styleImage">

                <img
                  src={style.image}
                  alt={style.title}
                />

              </div>



              <div className="styleCardContent">


                <div className="styleNumber">
                  {style.number}
                </div>


                <h2>
                  {style.title}
                </h2>


                <p>
                  {style.description}
                </p>


                <div className="styleChoose">

                  Choose
                  <span>
                    →
                  </span>

                </div>


              </div>


            </Link>

          ))}


        </div>


      </section>


    </main>

  );
}




export default function SetupPage(){

  return (

    <Suspense

      fallback={

        <main className="setupPage">

          <div
            style={{
              minHeight:"100vh",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
            }}
          >
            Loading...
          </div>

        </main>

      }

    >

      <SetupContent />

    </Suspense>

  );

}
