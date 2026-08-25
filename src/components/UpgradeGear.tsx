import Image from "next/image";

export default function UpgradeGear() {
  return (
    <section className="journeySection reverse">

      <div className="journeyText">

        <p className="number">
          02
        </p>

        <h2>
          UPGRADE GEAR
        </h2>

        <p className="subtitle">
          Improve comfort and capability.
        </p>

      </div>


      <div className="journeyImage">

        <Image
          src="/upgrade-gear.jpg"
          alt="Upgrade gear"
          fill
        />

      </div>


    </section>
  );
}
