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

      </div>


      <div className="journeyImage">

        <Image
          src="/first-setup.jpg"
          alt="First setup"
          fill
        />

      </div>

    </section>
  );
}
