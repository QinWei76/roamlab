import Image from "next/image";

export default function Hero() {
  return (
    <main className="hero">

      <Image
        src="/hero.jpg"
        alt="RoamLab car camping system"
        fill
        priority
        className="heroImage"
      />

      <div className="overlay"></div>

      <header className="header">

        <div className="logo">
          ROAMLAB
        </div>

        <nav>
          <span>Start Here</span>
          <span>Gear Lab</span>
          <span>Vehicles</span>
        </nav>

      </header>


      <section className="content">

        <p className="eyebrow">
          RESEARCH-DRIVEN GEAR GUIDES
        </p>


        <h1>
          Build Your Dream
          <br />
          Car Camping
          <br />
          System
        </h1>


        <p className="desc">
          Research-driven gear guides for smarter outdoor systems.
        </p>


        <button>
          Build Your Setup →
        </button>


      </section>

    </main>
  );
}
