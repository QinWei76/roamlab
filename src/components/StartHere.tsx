import Image from "next/image";

export default function StartHere() {
  return (
    <main className="startHero">

      <Image
        src="/start-here-hero.jpg"
        alt="RoamLab garage setup"
        fill
        priority
        className="startImage"
      />

      <div className="startOverlay"></div>


      <header className="header">

        <div className="logo">
          ROAMLAB
        </div>


        <nav>
          <span>Home</span>
          <span>Gear Lab</span>
          <span>Vehicles</span>
        </nav>

      </header>


      <section className="startContent">

        <p className="eyebrow">
          START HERE
        </p>


        <h1>
          Build Your First
          <br />
          Car Camping System
        </h1>


        <p className="desc">
          Start simple. Build smart.
          Create your complete vehicle system.
        </p>


        <button>
          Start Building →
        </button>


      </section>

    </main>
  );
}
