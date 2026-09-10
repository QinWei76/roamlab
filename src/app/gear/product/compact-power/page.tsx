import Link from "next/link";
import styles from "./product.module.css";

const affiliateLinks = {
  ecoflow: "",
  jackery: "",
  bluetti: "",
};

const specs = [
  { label: "CAPACITY", value: "200–300Wh" },
  { label: "OUTPUT", value: "300–600W" },
  { label: "WEIGHT", value: "7.9–10.4 lb" },
  { label: "BEST FOR", value: "1–2 night trips" },
];

const pros = [
  "Easy to carry and store",
  "Ideal for phones, cameras and camp lighting",
  "Fits easily into smaller vehicles",
  "Simple entry point into portable power",
];

const cons = [
  "Limited runtime for high-draw appliances",
  "Not designed for extended off-grid systems",
];

const topPicks = [
  {
    badge: "BEST OVERALL",
    brand: "ECOFLOW",
    name: "RIVER 3 Plus",
    capacity: "286Wh",
    output: "600W",
    weight: "10.4 lb",
    description:
      "Our strongest all-round compact pick. High output for its size, expandable capacity and a useful mix of charging options make it especially flexible for car camping.",
    image: "/power-ecoflow.jpg",
    affiliateUrl: affiliateLinks.ecoflow,
  },
  {
    badge: "BEST LIGHTWEIGHT",
    brand: "JACKERY",
    name: "Explorer 300 Plus",
    capacity: "288Wh",
    output: "300W",
    weight: "8.27 lb",
    description:
      "A lightweight option for campers who mainly need dependable charging for phones, cameras, lights, laptops and other small electronics.",
    image: "/power.jpg",
    affiliateUrl: affiliateLinks.jackery,
  },
  {
    badge: "MINIMAL SETUP",
    brand: "BLUETTI",
    name: "AC2A",
    capacity: "204.8Wh",
    output: "300W",
    weight: "7.9 lb",
    description:
      "The smallest-capacity pick here. Best suited to minimalist setups where portability matters more than long runtime.",
    image: "/power.jpg",
    affiliateUrl: affiliateLinks.bluetti,
  },
];

export default function CompactPowerPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          ROAMLAB
        </Link>

        <nav className={styles.nav}>
          <Link href="/explore">EXPLORE</Link>
          <Link href="/plan">PLAN</Link>
          <Link href="/gear" className={styles.active}>
            GEAR
          </Link>
          <Link href="/prepare">PREPARE</Link>
          <Link href="/safety">SAFETY</Link>
          <Link href="/learn">LEARN</Link>
          <Link href="/journal">JOURNAL</Link>
          <Link href="/stories">STORIES</Link>
        </nav>

        <div className={styles.headerActions}>
          <Link href="/signin" className={styles.signIn}>
            SIGN IN
          </Link>

          <Link href="/ways-in" className={styles.startButton}>
            START YOUR WILD →
          </Link>
        </div>
      </header>

      <div className={styles.breadcrumb}>
        <Link href="/gear">GEAR</Link>
        <span>→</span>
        <Link href="/gear/power">POWER</Link>
        <span>→</span>
        <strong>COMPACT POWER</strong>
      </div>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroImageWrap}>
          <img
            src="/power-ecoflow.jpg"
            alt="Portable power station for car camping"
            className={styles.heroImage}
          />
        </div>

        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>ROAMLAB POWER GUIDE</p>

          <h1>Compact Power</h1>

          <p className={styles.subtitle}>
            Lightweight portable power for weekend trips, smaller vehicles
            and simple camp electronics.
          </p>

          <div className={styles.heroMeta}>
            <div>
              <span>POWER CLASS</span>
              <strong>200–300Wh</strong>
            </div>

            <div>
              <span>TRIP LENGTH</span>
              <strong>1–2 NIGHTS</strong>
            </div>

            <div>
              <span>ROAMLAB FIT</span>
              <strong>WEEKEND</strong>
            </div>
          </div>

          <a href="#top-picks" className={styles.primaryButton}>
            SEE TOP PICKS →
          </a>
        </div>
      </section>

      {/* BEST FOR */}
      <section className={styles.bestFor}>
        <div>
          <p className={styles.eyebrow}>BEST FOR</p>
          <h2>Simple Trips. Small Loads. Easy Packing.</h2>
        </div>

        <p>
          Compact power stations make sense when your electrical system is
          mostly phones, cameras, lights, laptops and other small devices.
          They keep the setup portable without forcing you into a much larger
          battery system.
        </p>
      </section>

      {/* SPECS */}
      <section className={styles.specSection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>POWER PROFILE</p>
            <h2>What Compact Power Looks Like</h2>
          </div>

          <p>
            Enough power for essential electronics.
            <br />
            Small enough to keep the vehicle simple.
          </p>
        </div>

        <div className={styles.specGrid}>
          {specs.map((spec) => (
            <div className={styles.specCard} key={spec.label}>
              <span>{spec.label}</span>
              <strong>{spec.value}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className={styles.whySection}>
        <div className={styles.whyImageWrap}>
          <img
            src="/power.jpg"
            alt="Portable power system outdoors"
            className={styles.whyImage}
          />
        </div>

        <div className={styles.whyContent}>
          <p className={styles.eyebrow}>WHY START HERE</p>

          <h2>
            Enough Power
            <br />
            Without Overbuilding
          </h2>

          <p>
            For a first car-camping electrical system, compact power is often
            the easiest place to begin. You get useful off-grid charging
            without giving up much cargo space.
          </p>

          <div className={styles.useList}>
            <span>Phones</span>
            <span>Headlamps</span>
            <span>Cameras</span>
            <span>Laptops</span>
            <span>Camp Lights</span>
          </div>
        </div>
      </section>

      {/* PROS / LIMITS */}
      <section className={styles.proConSection}>
        <div className={styles.proCard}>
          <p className={styles.eyebrow}>PROS</p>
          <h3>Why It Works</h3>

          <ul>
            {pros.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className={styles.conCard}>
          <p className={styles.eyebrow}>LIMITS</p>
          <h3>Where It Falls Short</h3>

          <ul>
            {cons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* VERDICT */}
      <section className={styles.verdict}>
        <div>
          <p className={styles.eyebrow}>ROAMLAB VERDICT</p>

          <h2>
            Start Small.
            <br />
            Upgrade When The Trip Demands It.
          </h2>
        </div>

        <p>
          If you mainly need to keep personal electronics running through a
          weekend, this is the class we would start with. Move to a larger
          system when refrigeration, cooking appliances or longer off-grid
          stays become part of the plan.
        </p>
      </section>

      {/* TOP PICKS */}
      <section id="top-picks" className={styles.topPicks}>
        <div className={styles.topPicksIntro}>
          <p className={styles.eyebrow}>ROAMLAB RECOMMENDATIONS</p>
          <h2>Top Picks For Compact Power</h2>
          <p>
            Three different approaches to the same job. Choose based on how
            much output, weight and flexibility your setup actually needs.
          </p>
        </div>

        <div className={styles.pickGrid}>
          {topPicks.map((product) => (
            <article className={styles.pickCard} key={product.name}>
              <div className={styles.pickImageWrap}>
                <img
                  src={product.image}
                  alt={`${product.brand} ${product.name}`}
                  className={styles.pickImage}
                />

                <span className={styles.pickBadge}>{product.badge}</span>
              </div>

              <div className={styles.pickContent}>
                <p className={styles.productBrand}>{product.brand}</p>

                <h3>{product.name}</h3>

                <div className={styles.productSpecs}>
                  <div>
                    <span>CAPACITY</span>
                    <strong>{product.capacity}</strong>
                  </div>

                  <div>
                    <span>OUTPUT</span>
                    <strong>{product.output}</strong>
                  </div>

                  <div>
                    <span>WEIGHT</span>
                    <strong>{product.weight}</strong>
                  </div>
                </div>

                <p className={styles.productDescription}>
                  {product.description}
                </p>

                {product.affiliateUrl ? (
                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    className={styles.productButton}
                  >
                    VIEW PRODUCT →
                  </a>
                ) : (
                  <button
                    type="button"
                    className={`${styles.productButton} ${styles.disabledButton}`}
                    disabled
                  >
                    AFFILIATE LINK COMING SOON
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className={styles.disclosure}>
          Affiliate disclosure: RoamLab may earn a commission from qualifying
          purchases made through links on this page, at no additional cost to
          you.
        </p>
      </section>

      {/* DECISION */}
      <section className={styles.decision}>
        <p className={styles.eyebrow}>QUICK DECISION</p>

        <h2>Which One Should You Choose?</h2>

        <div className={styles.decisionGrid}>
          <div>
            <span>01</span>
            <strong>Want the strongest all-round option?</strong>
            <p>Start with the EcoFlow RIVER 3 Plus.</p>
          </div>

          <div>
            <span>02</span>
            <strong>Weight matters most?</strong>
            <p>Look at the Jackery Explorer 300 Plus.</p>
          </div>

          <div>
            <span>03</span>
            <strong>Building the smallest possible setup?</strong>
            <p>The BLUETTI AC2A keeps things minimal.</p>
          </div>
        </div>
      </section>

      {/* NEXT */}
      <section className={styles.nextStep}>
        <div>
          <p className={styles.eyebrow}>KEEP BUILDING</p>
          <h2>Need more capacity?</h2>
        </div>

        <div className={styles.nextActions}>
          <Link href="/gear/power" className={styles.secondaryButton}>
            ← BACK TO POWER
          </Link>

          <Link
            href="/gear/product/mid-size-power"
            className={styles.primaryButton}
          >
            NEXT: MID-SIZE POWER →
          </Link>
        </div>
      </section>
    </main>
  );
}
