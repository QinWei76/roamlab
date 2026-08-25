import Image from "next/image";

export default function FirstSetup() {
  return (
    <section className="journeySection">

      <div className="journeyText">

        <p className="number">
          01
        </p>

        <h2>
          FIRST SETUP
        </h2>

        <p className="subtitle">
          Start with the essentials.
        </p>

        <div className="features">
          <span>Power</span>
          <span>Sleep</span>
          <span>Storage</span>
          <span>Cooking</span>
        </div>

      </div>


      <div className="journeyImage">

        <Image
          src="/first-setup.jpg"
          alt="First car camping setup"
          fill
        />

      </div>


    </section>
  );
}
