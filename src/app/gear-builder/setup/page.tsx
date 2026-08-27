"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

const styles = [
  {
    id: "weekend",
    number: "01",
    title: "Weekend Escape",
    description:
      "Simple, flexible and easy to set up. Perfect for short weekend adventures.",
  },
  {
    id: "off-grid",
    number: "02",
    title: "Off-Grid Camping",
    description:
      "Stay longer, go further and build a more independent camping system.",
  },
  {
    id: "road-trip",
    number: "03",
    title: "Road Trip",
    description:
      "Designed for long-distance travel with comfort, storage and efficiency.",
  },
  {
    id: "basecamp",
    number: "04",
    title: "Basecamp Setup",
    description:
      "Create a comfortable outdoor base for longer stays and bigger adventures.",
  },
];

export default function SetupPage() {
  const searchParams = useSearchParams();

  const vehicle = searchParams.get("vehicle") || "SUV";

  return (
    <main className="setupPage">
      {/* TOP BAR */}

      <div className="setupTopbar">
        <Link href="/gear-builder" className="backButton">
          ← Back
        </Link>

        <div className="setupProgress">
          <span className="active">01 Vehicle</span>
          <span className="progressLine" />
          <span className="active">02 Style</span>
          <span className="progressLine" />
          <span>03 Budget</span>
        </div>
      </div>

      {/* HERO */}

      <section className="setupHero">
        <div className="setupStep">STEP 02</div>

        <p className="setupVehicle">
          YOUR VEHICLE · {vehicle.toUpperCase()}
        </p>

        <h1>
          How do you
          <br />
          want to camp?
        </h1>

        <p>
          Your camping style helps us build a system that fits how you actually
          travel.
        </p>
      </section>

      {/* STYLE OPTIONS */}

      <section className="styleSection">
        <div className="styleGrid">
          {styles.map((style) => (
            <Link
              key={style.id}
              href={`/gear-builder/budget?vehicle=${vehicle}&style=${style.id}`}
              className="styleCard"
            >
              <div className="styleNumber">{style.number}</div>

              <h2>{style.title}</h2>

              <p>{style.description}</p>

              <div className="styleChoose">
                Choose <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
