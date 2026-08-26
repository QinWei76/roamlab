import Image from "next/image";
import Link from "next/link";

const vehicles = [
  {
    name: "SUV",
    desc: "Flexible setup for weekend adventures.",
    image: "/vehicle-suv.jpg",
  },
  {
    name: "Truck",
    desc: "More space. More capability.",
    image: "/vehicle-truck.jpg",
  },
  {
    name: "Van",
    desc: "Build a complete travel system.",
    image: "/vehicle-van.jpg",
  },
  {
    name: "EV",
    desc: "Modern electric adventure setup.",
    image: "/vehicle-ev.jpg",
  },
];

export default function GearBuilderPage() {
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

        <div className="builderOverlay" />

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
            <br />
            We will help create your setup.
          </p>
        </div>
      </section>

      {/* VEHICLE SELECT */}
      <section className="vehicleSection">
        <div className="vehicleSectionHeader">
          <p className="vehicleEyebrow">
            STEP 01
          </p>

          <h2>
            What do you drive?
          </h2>

          <p className="vehicleIntro">
            Choose your vehicle to start building your camping system.
          </p>
        </div>

        <div className="vehicleGrid">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.name}
              href={`/gear-builder/setup?vehicle=${vehicle.name}`}
              className="vehicleCard"
            >
              <div className="vehicleCardImage">
                <img
                  src={vehicle.image}
                  alt={`${vehicle.name} camping setup`}
                />
              </div>

              <div className="vehicleCardContent">
                <h3>{vehicle.name}</h3>

                <p>{vehicle.desc}</p>

                <span>
                  Choose <strong>→</strong>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
