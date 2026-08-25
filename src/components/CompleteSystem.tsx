import Image from "next/image";


export default function CompleteSystem() {

  return (

    <section className="journeySection">


      <div className="journeyText">


        <p className="number">
          03
        </p>


        <h2>
          COMPLETE SYSTEM
        </h2>


        <p className="subtitle">
          Build around your vehicle.
        </p>


        <p className="desc">
          When the right gear comes together,
          your setup becomes more than a camp —
          it becomes your base for anywhere.
        </p>


      </div>



      <div className="journeyImage">


        <Image

          src="/complete-system.jpg"

          alt="Complete vehicle camping system"

          fill

          className="systemImage"

        />


      </div>


    </section>

  );

}
