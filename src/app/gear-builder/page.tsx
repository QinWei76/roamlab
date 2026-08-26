import Image from "next/image";
import Link from "next/link";


export default function GearBuilderPage() {


  const vehicles = [

    {
      name: "SUV",
      desc: "Flexible setup for weekend adventures.",
      image: "/vehicle-suv.jpg"
    },

    {
      name: "Truck",
      desc: "More space. More capability.",
      image: "/vehicle-truck.jpg"
    },

    {
      name: "Van",
      desc: "Build a complete travel system.",
      image: "/vehicle-van.jpg"
    },

    {
      name: "EV",
      desc: "Modern electric adventure setup.",
      image: "/vehicle-ev.jpg"
    }

  ];



  return (

    <main className="builderPage">


      {/* HERO */}

      <section className="builderHero">


        <Image

          src="/gear-builder-hero.jpg"

          alt="Gear Builder"

          fill

          priority

          className="builderImage"

        />



        <div className="builderOverlay"></div>



        <div className="builderContent">


          <div className="builderEyebrow">

            GEAR BUILDER

          </div>



          <h1>

            Build Your

            <br />

            Camping System

          </h1>



          <p className="builderDesc">

            Start with your vehicle.

            <br />

            We will help create your setup.

          </p>


        </div>


      </section>





      {/* VEHICLE SELECT */}


      <section className="vehicleSection">


        <h2>

          What do you drive?

        </h2>




        <div className="vehicleGrid">


          {vehicles.map((vehicle)=>(


            <Link


              key={vehicle.name}


              href={`/gear-builder/setup?vehicle=${vehicle.name}`}


              className="vehicleCard"



            >



              <div


                className="vehicleCardImage"


                style={{

                  backgroundImage:

                  `url("${vehicle.image}")`

                }}


              />





              <div className="vehicleCardContent">



                <h3>

                  {vehicle.name}

                </h3>



                <p>

                  {vehicle.desc}

                </p>



                <span>

                  Choose →

                </span>



              </div>


            </Link>


          ))}



        </div>


      </section>



    </main>

  );

}
