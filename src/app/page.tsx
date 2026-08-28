import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="startHero">
        {/* Background Image */}
        <Image
          src="/start-here-hero.jpg"
          alt="Vehicle camping by a lake"
          fill
          priority
          style={{
            objectFit: "cover",
          }}
        />

        {/* Dark Overlay */}
        <div className="startOverlay" />

        {/* Header */}
        <header className="header">
          <Link href="/" className="logo">
            ROAMLAB
          </Link>

          <nav>
            <Link href="/">Home</Link>

            <Link href="/start-here">
              Start Here
            </Link>

            <Link href="/gear-builder">
              Gear Builder
            </Link>

            <Link href="/gear/sleeping">
              Gear Lab
            </Link>
          </nav>
        </header>

        {/* Hero Content */}
        <div className="startContent">
          <p className="eyebrow">
            START HERE
          </p>

          <h1>
            Start simple.
            <br />
            Build smart.
            <br />
            Create your complete
            <br />
            vehicle system.
          </h1>

          <p>
            Build a practical camping setup around your vehicle,
            your travel style and the adventures you want to take.
          </p>

          {/* Working Button */}
          <Link
            href="/gear-builder"
            className="primaryButton"
          >
            Start Building →
          </Link>
        </div>
      </section>
    </main>
  );
}
