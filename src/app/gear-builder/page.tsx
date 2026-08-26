import Image from "next/image";
import Link from "next/link";


export default function GearBuilderPage() {


  const vehicles = [
    {
      name: "SUV",
      desc: "Flexible setup for weekend adventures"
    },
    {
      name: "Truck",
      desc: "More space. More capability."
    },
    {
      name: "Van",
      desc: "Build a complete travel system."
    },
    {
      name: "EV",
      desc: "Modern electric adventure setup."
    }
  ];


  return (

    <main className="builderPage">


      {/* HERO */}

      <section className="builderHero">


        <Image
          src="/gear-builder-hero.jpg"
          alt="Camping gear setup"
          fill
          priority
          className="builderImage"
        />


        <div className="builderOverlay"></div>


        <div className="builderContent">


          <p className="builderEyebrow">
            GEAR BUILDER
          </p>


          <h1>
            Build Your
            <br />
            Camping System
          </h1>


          <p className="builderDesc">
            Start with your vehicle.
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


              <h3>
                {vehicle.name}
              </h3>


              <p>
                {vehicle.desc}
              </p>


              <span>
                Choose →
              </span>


            </Link>


          ))}


        </div>


      </section>


    </main>

  );

}
