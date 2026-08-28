import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="homePage">
      {/* ================= HERO ================= */}

      <section className="homeHero">
        <Image
          src="/hero.jpg"
          alt="Vehicle camping adventure"
          fill
          priority
          className="homeHeroImage"
        />

        <div className="homeHeroOverlay" />

        {/* NAVIGATION */}

        <header className="homeHeader">
          <Link href="/" className="homeLogo">
            ROAMLAB
          </Link>

          <nav className="homeNav">
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

        {/* HERO CONTENT */}

        <div className="homeHeroContent">
          <p className="homeEyebrow">
            START HERE
          </p>

          <h1>
            Build Your First
            <br />
            Car Camping System
          </h1>

          <p className="homeHeroDescription">
            Start simple. Build smart. Create your complete vehicle system.
          </p>

          {/* 这里就是按钮，已经可以跳转 */}

          <Link
            href="/gear-builder"
            className="heroButton"
          >
            Start Building →
          </Link>
        </div>
      </section>

      {/* ================= INTRO ================= */}

      <section className="homeIntro">
        <div className="homeIntroLabel">
          THE ROAMLAB APPROACH
        </div>

        <div className="homeIntroContent">
          <h2>
            Camping gear is easier
            <br />
            when you build a system.
          </h2>

          <p>
            RoamLab helps you understand the gear, make better decisions,
            and build a practical vehicle camping setup that works together.
          </p>
        </div>
      </section>

      {/* ================= THREE STEPS ================= */}

      <section className="homeSteps">
        <div className="homeSectionHeader">
          <p className="sectionEyebrow">
            HOW IT WORKS
          </p>

          <h2>
            Build smarter.
            <br />
            Start simple.
          </h2>
        </div>

        <div className="homeStepsGrid">
          {/* STEP 01 */}

          <div className="homeStep">
            <div className="homeStepNumber">
              01
            </div>

            <h3>
              Choose Your Vehicle
            </h3>

            <p>
              Start with what you already drive and build a system around it.
            </p>
          </div>

          {/* STEP 02 */}

          <div className="homeStep">
            <div className="homeStepNumber">
              02
            </div>

            <h3>
              Choose Your Adventure
            </h3>

            <p>
              Weekend escape, road trip, off-grid camping or a complete basecamp.
            </p>
          </div>

          {/* STEP 03 */}

          <div className="homeStep">
            <div className="homeStepNumber">
              03
            </div>

            <h3>
              Build Your System
            </h3>

            <p>
              Get a simple gear system designed around how you actually travel.
            </p>
          </div>
        </div>
      </section>

      {/* ================= GEAR LAB ================= */}

      <section className="homeGear">
        <div className="homeGearImage">
          <Image
            src="/complete-system.jpg"
            alt="Complete vehicle camping system"
            fill
            className="homeGearPhoto"
          />
        </div>

        <div className="homeGearContent">
          <p className="sectionEyebrow">
            GEAR LAB
          </p>

          <h2>
            Understand the gear.
            <br />
            Build the system.
          </h2>

          <p>
            Explore sleeping, power, cooking, storage and lighting systems
            designed for real vehicle camping.
          </p>

          <Link
            href="/gear/sleeping"
            className="outlineButton"
          >
            Explore Gear Lab →
          </Link>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}

      <section className="homeCategories">
        <div className="homeSectionHeader">
          <p className="sectionEyebrow">
            EXPLORE SYSTEMS
          </p>

          <h2>
            Everything works
            <br />
            better together.
          </h2>
        </div>

        <div className="categoryGrid">
          <Link
            href="/gear/sleeping"
            className="categoryCard"
          >
            <Image
              src="/sleeping.jpg"
              alt="Sleeping system"
              fill
              className="categoryImage"
            />

            <div className="categoryOverlay" />

            <div className="categoryContent">
              <span>01</span>

              <h3>Sleeping</h3>

              <p>
                Build a better night outdoors.
              </p>

              <strong>
                Explore →
              </strong>
            </div>
          </Link>

          <Link
            href="/gear/power"
            className="categoryCard"
          >
            <Image
              src="/power.jpg"
              alt="Power system"
              fill
              className="categoryImage"
            />

            <div className="categoryOverlay" />

            <div className="categoryContent">
              <span>02</span>

              <h3>Power</h3>

              <p>
                Keep your camp powered.
              </p>

              <strong>
                Explore →
              </strong>
            </div>
          </Link>

          <Link
            href="/gear/cooking"
            className="categoryCard"
          >
            <Image
              src="/cooking.jpg"
              alt="Cooking system"
              fill
              className="categoryImage"
            />

            <div className="categoryOverlay" />

            <div className="categoryContent">
              <span>03</span>

              <h3>Cooking</h3>

              <p>
                Build a simple camp kitchen.
              </p>

              <strong>
                Explore →
              </strong>
            </div>
          </Link>

          <Link
            href="/gear/storage"
            className="categoryCard"
          >
            <Image
              src="/storage.jpg"
              alt="Storage system"
              fill
              className="categoryImage"
            />

            <div className="categoryOverlay" />

            <div className="categoryContent">
              <span>04</span>

              <h3>Storage</h3>

              <p>
                Keep your gear organized.
              </p>

              <strong>
                Explore →
              </strong>
            </div>
          </Link>

          <Link
            href="/gear/lighting"
            className="categoryCard"
          >
            <Image
              src="/lighting.jpg"
              alt="Lighting system"
              fill
              className="categoryImage"
            />

            <div className="categoryOverlay" />

            <div className="categoryContent">
              <span>05</span>

              <h3>Lighting</h3>

              <p>
                Make camp comfortable after dark.
              </p>

              <strong>
                Explore →
              </strong>
            </div>
          </Link>
        </div>
      </section>

      {/* ================= CTA ================= */}

      <section className="homeCTA">
        <p className="sectionEyebrow">
          READY TO START?
        </p>

        <h2>
          Build your camping system.
        </h2>

        <p>
          Start with your vehicle and discover the gear that makes sense for
          your adventure.
        </p>

        <Link
          href="/gear-builder"
          className="heroButton"
        >
          Start Building →
        </Link>
      </section>
    </main>
  );
}
